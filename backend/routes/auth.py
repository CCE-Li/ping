import secrets

from flask import Blueprint, jsonify, request

from db import db
from models.user import User


auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"success": False, "error": "username/password required"}), 400

    exists = User.query.filter_by(username=username).first()
    if exists:
        return jsonify({"success": False, "error": "username already exists"}), 409

    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = secrets.token_urlsafe(32)
    return jsonify({"success": True, "user": user.to_public_dict(), "token": token})


@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"success": False, "error": "username/password required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"success": False, "error": "invalid username or password"}), 401

    token = secrets.token_urlsafe(32)
    return jsonify({"success": True, "user": user.to_public_dict(), "token": token})
