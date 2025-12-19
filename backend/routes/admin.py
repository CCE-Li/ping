import secrets
import os

from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from db import db
from models.auth_token import AuthToken
from models.category import Category
from models.order import Order
from models.order_item import OrderItem
from models.product import Product
from models.user import User
from state import token_to_user_id


admin_bp = Blueprint("admin", __name__)


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


def _require_admin():
    user = _get_current_user()
    if not user:
        return None, (jsonify({"success": False, "error": "unauthorized"}), 401)
    if not bool(getattr(user, "is_admin", False)):
        return None, (jsonify({"success": False, "error": "forbidden"}), 403)
    return user, None


@admin_bp.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"success": False, "error": "username/password required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"success": False, "error": "invalid username or password"}), 401

    if not bool(getattr(user, "is_admin", False)):
        return jsonify({"success": False, "error": "not an admin"}), 403

    token = secrets.token_urlsafe(32)
    token_to_user_id[token] = user.id
    db.session.add(AuthToken(token=token, user_id=user.id))
    db.session.commit()

    return jsonify({"success": True, "user": user.to_public_dict(), "token": token})


@admin_bp.route("/api/admin/init", methods=["POST"])
def admin_init():
    init_key = (request.headers.get("X-Admin-Init-Key") or "").strip()
    required_key = (os.getenv("ADMIN_INIT_KEY") or "").strip()
    if not required_key or init_key != required_key:
        return jsonify({"success": False, "error": "forbidden"}), 403

    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    if not username or not password:
        return jsonify({"success": False, "error": "username/password required"}), 400

    user = User.query.filter_by(username=username).first()
    if user is None:
        user = User(username=username, is_admin=True)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
    else:
        user.is_admin = True
        user.set_password(password)
        db.session.commit()

    return jsonify({"success": True, "user": user.to_public_dict()})


@admin_bp.route("/api/admin/products", methods=["GET"])
def admin_list_products():
    _, err = _require_admin()
    if err:
        return err

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    if per_page <= 0:
        per_page = 20
    if per_page > 200:
        per_page = 200

    category_id = request.args.get("category_id", None, type=int)
    keyword = request.args.get("keyword", "", type=str) or request.args.get("q", "", type=str)

    query = Product.query
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)

    if keyword:
        like = f"%{keyword.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(like),
                Product.description.ilike(like),
            )
        )

    total_count = query.count()
    items = (
        query.order_by(Product.id.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return jsonify({"success": True, "count": total_count, "results": [p.to_dict() for p in items]})


@admin_bp.route("/api/admin/products", methods=["POST"])
def admin_create_product():
    _, err = _require_admin()
    if err:
        return err

    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "error": "name required"}), 400

    product = Product(
        name=name,
        description=payload.get("description"),
        price=float(payload.get("price") or 0),
        image=payload.get("image"),
        stock=int(payload.get("stock") or 0),
        rating=payload.get("rating"),
        category_id=payload.get("category_id"),
    )

    db.session.add(product)
    db.session.commit()
    return jsonify({"success": True, "data": product.to_dict()})


@admin_bp.route("/api/admin/products/<int:product_id>", methods=["PUT"])
def admin_update_product(product_id: int):
    _, err = _require_admin()
    if err:
        return err

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"success": False, "error": "Product not found"}), 404

    payload = request.get_json(silent=True) or {}

    if "name" in payload:
        product.name = (payload.get("name") or "").strip()
    if "description" in payload:
        product.description = payload.get("description")
    if "price" in payload:
        product.price = float(payload.get("price") or 0)
    if "image" in payload:
        product.image = payload.get("image")
    if "stock" in payload:
        product.stock = int(payload.get("stock") or 0)
    if "rating" in payload:
        product.rating = payload.get("rating")
    if "category_id" in payload:
        product.category_id = payload.get("category_id")

    if not product.name:
        return jsonify({"success": False, "error": "name required"}), 400

    db.session.commit()
    return jsonify({"success": True, "data": product.to_dict()})


@admin_bp.route("/api/admin/products/<int:product_id>", methods=["DELETE"])
def admin_delete_product(product_id: int):
    _, err = _require_admin()
    if err:
        return err

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"success": False, "error": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"success": True})


@admin_bp.route("/api/admin/products/stock/reset", methods=["POST"])
def admin_reset_products_stock():
    _, err = _require_admin()
    if err:
        return err

    payload = request.get_json(silent=True) or {}
    stock = payload.get("stock", 100)
    try:
        stock = int(stock)
    except Exception:
        return jsonify({"success": False, "error": "invalid stock"}), 400

    if stock < 0:
        return jsonify({"success": False, "error": "stock must be >= 0"}), 400

    Product.query.update({Product.stock: stock})
    db.session.commit()
    return jsonify({"success": True, "stock": stock})


@admin_bp.route("/api/admin/categories", methods=["GET"])
def admin_list_categories():
    _, err = _require_admin()
    if err:
        return err

    categories = Category.query.order_by(Category.id.asc()).all()
    return jsonify({"success": True, "data": [c.to_dict() for c in categories]})


@admin_bp.route("/api/admin/categories", methods=["POST"])
def admin_create_category():
    _, err = _require_admin()
    if err:
        return err

    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "error": "name required"}), 400

    exists = Category.query.filter(db.func.lower(Category.name) == name.lower()).first()
    if exists:
        return jsonify({"success": False, "error": "category already exists"}), 409

    category = Category(name=name, image=payload.get("image"))
    db.session.add(category)
    db.session.commit()
    return jsonify({"success": True, "data": category.to_dict()})


@admin_bp.route("/api/admin/categories/<int:category_id>", methods=["PUT"])
def admin_update_category(category_id: int):
    _, err = _require_admin()
    if err:
        return err

    category = Category.query.get(category_id)
    if not category:
        return jsonify({"success": False, "error": "Category not found"}), 404

    payload = request.get_json(silent=True) or {}

    if "name" in payload:
        new_name = (payload.get("name") or "").strip()
        if not new_name:
            return jsonify({"success": False, "error": "name required"}), 400
        exists = Category.query.filter(
            db.func.lower(Category.name) == new_name.lower(),
            Category.id != category.id,
        ).first()
        if exists:
            return jsonify({"success": False, "error": "category already exists"}), 409
        category.name = new_name

    if "image" in payload:
        category.image = payload.get("image")

    db.session.commit()
    return jsonify({"success": True, "data": category.to_dict()})


@admin_bp.route("/api/admin/categories/<int:category_id>", methods=["DELETE"])
def admin_delete_category(category_id: int):
    _, err = _require_admin()
    if err:
        return err

    category = Category.query.get(category_id)
    if not category:
        return jsonify({"success": False, "error": "Category not found"}), 404

    db.session.delete(category)
    db.session.commit()
    return jsonify({"success": True})


@admin_bp.route("/api/admin/users", methods=["GET"])
def admin_list_users():
    _, err = _require_admin()
    if err:
        return err

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    if per_page <= 0:
        per_page = 20
    if per_page > 200:
        per_page = 200

    query = User.query
    total_count = query.count()
    items = (
        query.order_by(User.id.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return jsonify({"success": True, "count": total_count, "results": [u.to_public_dict() for u in items]})


@admin_bp.route("/api/admin/users/<int:user_id>", methods=["PUT"])
def admin_update_user(user_id: int):
    _, err = _require_admin()
    if err:
        return err

    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    payload = request.get_json(silent=True) or {}

    if "is_admin" in payload:
        user.is_admin = bool(payload.get("is_admin"))

    if "password" in payload and payload.get("password"):
        user.set_password(payload.get("password"))

    db.session.commit()
    return jsonify({"success": True, "data": user.to_public_dict()})


@admin_bp.route("/api/admin/orders", methods=["GET"])
def admin_list_orders():
    _, err = _require_admin()
    if err:
        return err

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    if per_page <= 0:
        per_page = 20
    if per_page > 200:
        per_page = 200

    status = (request.args.get("status") or "").strip()
    user_id = request.args.get("user_id", None, type=int)

    query = Order.query
    if status:
        query = query.filter(Order.status == status)
    if user_id is not None:
        query = query.filter(Order.user_id == user_id)

    total_count = query.count()
    items = (
        query.order_by(Order.id.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return jsonify({
        "success": True,
        "count": total_count,
        "results": [
            {
                **o.to_dict(),
                "items": [i.to_dict() for i in o.items],
            }
            for o in items
        ],
    })


@admin_bp.route("/api/admin/orders/<int:order_id>", methods=["GET"])
def admin_get_order_detail(order_id: int):
    _, err = _require_admin()
    if err:
        return err

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"success": False, "error": "order not found"}), 404

    return jsonify({
        "success": True,
        "data": {
            **order.to_dict(),
            "items": [i.to_dict() for i in order.items],
        },
    })


@admin_bp.route("/api/admin/orders/<int:order_id>", methods=["PUT"])
def admin_update_order(order_id: int):
    _, err = _require_admin()
    if err:
        return err

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"success": False, "error": "order not found"}), 404

    payload = request.get_json(silent=True) or {}

    if "status" in payload:
        status = (payload.get("status") or "").strip()
        if not status:
            return jsonify({"success": False, "error": "status required"}), 400
        order.status = status

    if "recipient" in payload:
        order.recipient = (payload.get("recipient") or "").strip()
    if "phone" in payload:
        order.phone = (payload.get("phone") or "").strip()
    if "address" in payload:
        order.address = (payload.get("address") or "").strip()

    db.session.commit()
    return jsonify({
        "success": True,
        "data": {
            **order.to_dict(),
            "items": [i.to_dict() for i in order.items],
        },
    })


@admin_bp.route("/api/admin/orders/<int:order_id>", methods=["DELETE"])
def admin_delete_order(order_id: int):
    _, err = _require_admin()
    if err:
        return err

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"success": False, "error": "order not found"}), 404

    OrderItem.query.filter(OrderItem.order_id == order.id).delete()
    db.session.delete(order)
    db.session.commit()
    return jsonify({"success": True})
