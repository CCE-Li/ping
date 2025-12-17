import os
import re
import sqlite3
from typing import Any

import pymysql


def _env(name: str, default: str = "") -> str:
    v = os.getenv(name)
    return default if v is None else v


def _to_int(v: str, default: int) -> int:
    try:
        return int(v)
    except Exception:
        return default


def convert_sqlite_ddl_to_mysql(sqlite_sql: str) -> str:
    s = sqlite_sql.strip().rstrip(";")

    # Basic identifier quoting
    s = s.replace('"', "`")

    # AUTOINCREMENT patterns
    s = re.sub(
        r"\bINTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT\b",
        "BIGINT AUTO_INCREMENT PRIMARY KEY",
        s,
        flags=re.IGNORECASE,
    )

    # Types
    s = re.sub(r"\bINTEGER\b", "BIGINT", s, flags=re.IGNORECASE)
    s = re.sub(r"\bREAL\b", "DOUBLE", s, flags=re.IGNORECASE)
    s = re.sub(r"\bBLOB\b", "BLOB", s, flags=re.IGNORECASE)
    s = re.sub(r"\bTEXT\b", "TEXT", s, flags=re.IGNORECASE)
    # SQLite NUMERIC is flexible; keep as DECIMAL unless already specified
    s = re.sub(r"\bNUMERIC\b", "DECIMAL(20,6)", s, flags=re.IGNORECASE)

    # SQLite-specific clauses
    s = re.sub(r"\bAUTOINCREMENT\b", "", s, flags=re.IGNORECASE)

    return s + ";"


def convert_sqlite_index_to_mysql(sqlite_sql: str) -> str:
    s = sqlite_sql.strip().rstrip(";")
    s = s.replace('"', "`")
    return s + ";"


def recreate_schema(
    *,
    sqlite_path: str,
    mysql_host: str,
    mysql_port: int,
    mysql_user: str,
    mysql_password: str,
    mysql_database: str,
    create_db: bool = True,
    copy_data: bool = False,
) -> None:
    if not os.path.exists(sqlite_path):
        raise FileNotFoundError(f"sqlite db not found: {sqlite_path}")

    sqlite_con = sqlite3.connect(sqlite_path)
    sqlite_cur = sqlite_con.cursor()

    tables = sqlite_cur.execute(
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()

    indexes = sqlite_cur.execute(
        "SELECT name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()

    server_con = pymysql.connect(
        host=mysql_host,
        port=mysql_port,
        user=mysql_user,
        password=mysql_password,
        charset="utf8mb4",
        autocommit=True,
    )

    with server_con.cursor() as cur:
        if create_db:
            cur.execute(
                f"CREATE DATABASE IF NOT EXISTS `{mysql_database}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )

    server_con.close()

    mysql_con = pymysql.connect(
        host=mysql_host,
        port=mysql_port,
        user=mysql_user,
        password=mysql_password,
        database=mysql_database,
        charset="utf8mb4",
        autocommit=True,
    )

    with mysql_con.cursor() as cur:
        # Drop and recreate tables (best-effort). Disable FK checks for ordering.
        cur.execute("SET FOREIGN_KEY_CHECKS=0;")
        for name, _ in reversed(tables):
            cur.execute(f"DROP TABLE IF EXISTS `{name}`;")

        for name, sql in tables:
            if not sql:
                continue
            mysql_sql = convert_sqlite_ddl_to_mysql(sql)
            cur.execute(mysql_sql)

        for _, sql in indexes:
            mysql_sql = convert_sqlite_index_to_mysql(sql)
            cur.execute(mysql_sql)

        cur.execute("SET FOREIGN_KEY_CHECKS=1;")

    if copy_data:
        copy_sqlite_data_to_mysql(sqlite_con, mysql_con, tables)

    mysql_con.close()
    sqlite_con.close()


def copy_sqlite_data_to_mysql(
    sqlite_con: sqlite3.Connection,
    mysql_con: pymysql.connections.Connection,
    tables: list[tuple[str, Any]],
) -> None:
    sqlite_cur = sqlite_con.cursor()

    with mysql_con.cursor() as mysql_cur:
        mysql_cur.execute("SET FOREIGN_KEY_CHECKS=0;")

        for table_name, _ in tables:
            cols = sqlite_cur.execute(f"PRAGMA table_info('{table_name}')").fetchall()
            col_names = [c[1] for c in cols]
            if not col_names:
                continue

            rows = sqlite_cur.execute(f"SELECT * FROM '{table_name}'").fetchall()
            if not rows:
                continue

            placeholders = ",".join(["%s"] * len(col_names))
            columns_sql = ",".join([f"`{c}`" for c in col_names])
            insert_sql = f"INSERT INTO `{table_name}` ({columns_sql}) VALUES ({placeholders})"
            mysql_cur.executemany(insert_sql, rows)

        mysql_cur.execute("SET FOREIGN_KEY_CHECKS=1;")


if __name__ == "__main__":
    sqlite_path = _env("SQLITE_PATH", "db.sqlite3")

    mysql_host = _env("MYSQL_HOST", "127.0.0.1")
    mysql_port = _to_int(_env("MYSQL_PORT", "3306"), 3306)
    mysql_user = _env("MYSQL_USER", "root")
    mysql_password = _env("MYSQL_PASSWORD", "")
    mysql_database = _env("MYSQL_DATABASE", "shopping_platform")

    print(
        "MySQL target:",
        {
            "host": mysql_host,
            "port": mysql_port,
            "user": mysql_user,
            "database": mysql_database,
            "password_set": bool(mysql_password),
            "sqlite_path": sqlite_path,
        },
    )

    if mysql_user == "root" and not mysql_password:
        raise RuntimeError(
            "MYSQL_PASSWORD is empty. Set it in the same terminal session before running. "
            "(Your error shows 'using password: NO'.)"
        )

    create_db = _env("CREATE_DB", "1") not in {"0", "false", "False"}
    copy_data = _env("COPY_DATA", "0") in {"1", "true", "True"}

    recreate_schema(
        sqlite_path=sqlite_path,
        mysql_host=mysql_host,
        mysql_port=mysql_port,
        mysql_user=mysql_user,
        mysql_password=mysql_password,
        mysql_database=mysql_database,
        create_db=create_db,
        copy_data=copy_data,
    )

    print("Done.")
