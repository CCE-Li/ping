import time

from flask import Blueprint, jsonify, request
from sqlalchemy import text

from db import db

health_bp = Blueprint("health", __name__)


class DbTestRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.Integer, nullable=False)


@health_bp.route("/api/health", methods=["GET"])
def health_check():
    return jsonify(
        {
            "code": 0,
            "msg": "success",
            "data": {
                "status": "running",
                "service": "wechat-support-api",
                "timestamp": int(time.time()),
            },
        }
    )


@health_bp.route("/api/db/ping", methods=["GET"])
def db_ping():
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify({"code": 0, "msg": "success", "data": {"db": "ok"}})
    except Exception as e:
        return jsonify({"code": 500, "msg": f"db ping failed: {str(e)}", "data": {}})


@health_bp.route("/api/db/test_insert", methods=["POST"])
def db_test_insert():
    try:
        data = request.get_json(silent=True) or {}
        content = data.get("content") or "hello"

        record = DbTestRecord(content=str(content)[:255], created_at=int(time.time()))
        db.session.add(record)
        db.session.commit()

        row = DbTestRecord.query.order_by(DbTestRecord.id.desc()).first()
        return jsonify(
            {
                "code": 0,
                "msg": "success",
                "data": {
                    "id": row.id,
                    "content": row.content,
                    "created_at": row.created_at,
                },
            }
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"code": 500, "msg": f"db test insert failed: {str(e)}", "data": {}})
