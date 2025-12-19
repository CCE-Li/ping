from flask import Blueprint, jsonify, request

from db import db
from models.auth_token import AuthToken
from models.user import User
from models.user_profile import UserProfile
from state import token_to_user_id


user_bp = Blueprint("user", __name__)


def _get_bearer_token() -> str:
    auth = request.headers.get("Authorization") or ""
    if auth.lower().startswith("bearer "):
        return auth[7:].strip()
    return ""


def _get_current_user():
    token = _get_bearer_token()
    if not token:
        return None
    auth_row = AuthToken.query.filter_by(token=token).first()
    if auth_row:
        return User.query.get(int(auth_row.user_id))
    user_id = token_to_user_id.get(token)
    if not user_id:
        return None
    return User.query.get(int(user_id))


@user_bp.route("/api/user", methods=["GET"])
def get_user():
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "error": "unauthorized"}), 401

    profile = UserProfile.query.filter_by(user_id=user.id).first()
    if profile is None:
        profile = UserProfile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()

    data = user.to_public_dict()
    data.update(profile.to_dict())
    return jsonify({"success": True, "data": data})


@user_bp.route("/api/user", methods=["PUT"])
def update_user():
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "error": "unauthorized"}), 401

    payload = request.get_json(silent=True) or {}

    profile = UserProfile.query.filter_by(user_id=user.id).first()
    if profile is None:
        profile = UserProfile(user_id=user.id)
        db.session.add(profile)

    nickname = payload.get("nickname")
    phone = payload.get("phone")
    avatar = payload.get("avatar")
    gender = payload.get("gender")
    bio = payload.get("bio")

    if nickname is not None:
        profile.nickname = (nickname or "").strip() or None
    if phone is not None:
        profile.phone = (phone or "").strip() or None
    if avatar is not None:
        profile.avatar = (avatar or "").strip() or None
    if gender is not None:
        profile.gender = (gender or "").strip() or None
    if bio is not None:
        profile.bio = (bio or "").strip() or None

    db.session.commit()

    data = user.to_public_dict()
    data.update(profile.to_dict())
    return jsonify({"success": True, "data": data})
