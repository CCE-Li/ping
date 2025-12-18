import json
from pathlib import Path


def _infer_category(name: str) -> str:
    n = (name or "").lower()
    if any(keyword in n for keyword in ["backpack", "pack"]):
        return "bags"
    if any(keyword in n for keyword in ["shirt", "t-shirt", "top"]):
        return "clothing"
    if any(keyword in n for keyword in ["jacket", "coat"]):
        return "outerwear"
    if any(keyword in n for keyword in ["jewelry", "bracelet", "ring", "earrings"]):
        return "jewelry"
    if any(keyword in n for keyword in ["hard drive", "ssd", "usb"]):
        return "electronics"
    if any(keyword in n for keyword in ["laptop", "computer", "pc"]):
        return "computers"
    if any(keyword in n for keyword in ["watch", "clock"]):
        return "watches"
    return "other"


def _sql_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "''")


def main() -> None:
    repo_root = Path(__file__).resolve().parent
    products_json = repo_root / "products_data.json"
    out_sql = repo_root / "seed.sql"

    payload = json.loads(products_json.read_text(encoding="utf-8"))
    products = payload.get("products")
    if not isinstance(products, list):
        products = payload.get("items")
    if not isinstance(products, list):
        raise ValueError("Unsupported JSON format: expected list under 'products' or 'items'")

    # Match backend/import_products_json_to_db.py behavior:
    # categories are created on first encounter by inferred key.
    category_order: list[str] = []
    category_id_by_key: dict[str, int] = {}
    category_image_by_key: dict[str, str | None] = {}

    for p in products:
        key = _infer_category(str(p.get("name", "")))
        if key not in category_id_by_key:
            category_order.append(key)
            category_id_by_key[key] = len(category_order)
            category_image_by_key[key] = p.get("image")

    lines: list[str] = []
    lines.append("USE shopping_platform;\n")
    lines.append("SET NAMES utf8mb4;\n")
    lines.append("START TRANSACTION;\n\n")

    # Clear existing (optional, but safe for re-runs)
    lines.append("SET FOREIGN_KEY_CHECKS=0;\n")
    lines.append("TRUNCATE TABLE `products`;\n")
    lines.append("TRUNCATE TABLE `categories`;\n")
    lines.append("SET FOREIGN_KEY_CHECKS=1;\n\n")

    # Insert categories
    lines.append("INSERT INTO `categories` (`id`, `name`, `image`) VALUES\n")
    cat_values: list[str] = []
    for key in category_order:
        cid = category_id_by_key[key]
        name = key.capitalize()
        image = category_image_by_key.get(key)
        if image is None:
            cat_values.append(f"({cid}, '{_sql_escape(name)}', NULL)")
        else:
            cat_values.append(f"({cid}, '{_sql_escape(name)}', '{_sql_escape(str(image))}')")
    lines.append(",\n".join(cat_values) + ";\n\n")

    # Insert products
    lines.append(
        "INSERT INTO `products` (\n"
        "  `id`, `name`, `description`, `price`, `image`, `stock`, `rating`, `category_id`\n"
        ") VALUES\n"
    )

    prod_values: list[str] = []
    for p in products:
        pid = p.get("id")
        name = (p.get("name") or "").strip()
        if not name:
            continue

        desc = p.get("description")
        price = float(p.get("price") or 0)
        image = p.get("image")
        stock = int(p.get("stock") or 0)
        rating = p.get("rating")
        rating_sql = "NULL" if rating is None else str(float(rating))

        cat_key = _infer_category(name)
        cat_id = category_id_by_key.get(cat_key)
        cat_id_sql = "NULL" if cat_id is None else str(int(cat_id))

        pid_sql = "NULL" if pid is None else str(int(pid))

        name_sql = f"'{_sql_escape(name)}'"
        desc_sql = "NULL" if desc is None else f"'{_sql_escape(str(desc))}'"
        image_sql = "NULL" if image is None else f"'{_sql_escape(str(image))}'"

        prod_values.append(
            "(" + ", ".join(
                [
                    pid_sql,
                    name_sql,
                    desc_sql,
                    str(price),
                    image_sql,
                    str(stock),
                    rating_sql,
                    cat_id_sql,
                ]
            ) + ")"
        )

    lines.append(",\n".join(prod_values) + ";\n\n")

    lines.append("COMMIT;\n")

    out_sql.write_text("".join(lines), encoding="utf-8")
    print(f"Wrote: {out_sql}")


if __name__ == "__main__":
    main()
