import time

from flask import Blueprint, jsonify, request

from db import db
from models.auth_token import AuthToken
from models.order import Order
from models.order_item import OrderItem
from models.product import Product
from models.user import User
from state import token_to_user_id


orders_bp = Blueprint("orders", __name__)


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


@orders_bp.route("/api/orders", methods=["POST"])
def create_order():
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "error": "unauthorized"}), 401

    payload = request.get_json(silent=True) or {}
    recipient = (payload.get("recipient") or "").strip()
    phone = (payload.get("phone") or "").strip()
    address = (payload.get("address") or "").strip()
    items = payload.get("items") or []

    if not recipient or not phone or not address:
        return jsonify({"success": False, "error": "recipient/phone/address required"}), 400
    if not isinstance(items, list) or not items:
        return jsonify({"success": False, "error": "items required"}), 400

    order = Order(
        user_id=user.id,
        recipient=recipient,
        phone=phone,
        address=address,
        status="pending",
        created_at=int(time.time()),
    )
    db.session.add(order)
    db.session.flush()  # get order.id

    total_amount = 0.0

    for idx, it in enumerate(items):
        try:
            product_id = int(it.get("product_id"))
            quantity = int(it.get("quantity"))
        except Exception:
            return jsonify({"success": False, "error": f"invalid item at index {idx}"}), 400

        if quantity <= 0:
            return jsonify({"success": False, "error": f"quantity must be >0 at index {idx}"}), 400

        product = Product.query.get(product_id)
        if not product:
            return jsonify({"success": False, "error": f"product not found: {product_id}"}), 404

        if product.stock is not None and product.stock < quantity:
            return jsonify({
                "success": False,
                "error": f"stock not enough: {product_id} ({product.name}), stock={int(product.stock)}, need={quantity}",
            }), 400

        price = float(product.price or 0.0)
        subtotal = price * quantity
        total_amount += subtotal

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            product_name=product.name,
            product_price=price,
            quantity=quantity,
            subtotal=subtotal,
        )
        db.session.add(order_item)

        if product.stock is not None:
            product.stock = int(product.stock) - quantity

    order.total_amount = total_amount
    db.session.commit()

    return jsonify({
        "success": True,
        "data": {
            **order.to_dict(),
            "items": [i.to_dict() for i in order.items],
        }
    })


@orders_bp.route("/api/orders/<int:order_id>/pay", methods=["POST"])
def pay_order(order_id: int):
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "error": "unauthorized"}), 401

    order = Order.query.get(order_id)
    if not order or order.user_id != user.id:
        return jsonify({"success": False, "error": "order not found"}), 404

    if (order.status or "") != "pending":
        return jsonify({"success": False, "error": "order is not pending"}), 400

    order.status = "shipping"
    db.session.commit()

    return jsonify({
        "success": True,
        "data": {
            **order.to_dict(),
            "items": [i.to_dict() for i in order.items],
        }
    })


@orders_bp.route("/api/orders", methods=["GET"])
def list_orders():
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "error": "unauthorized"}), 401

    status = (request.args.get("status") or "").strip()

    query = Order.query.filter(Order.user_id == user.id)
    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.id.desc()).all()
    return jsonify({
        "success": True,
        "data": [
            {
                **o.to_dict(),
                "items": [i.to_dict() for i in o.items],
            }
            for o in orders
        ]
    })


@orders_bp.route("/api/orders/<int:order_id>", methods=["GET"])
def get_order_detail(order_id: int):
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "error": "unauthorized"}), 401

    order = Order.query.get(order_id)
    if not order or order.user_id != user.id:
        return jsonify({"success": False, "error": "order not found"}), 404

    return jsonify({
        "success": True,
        "data": {
            **order.to_dict(),
            "items": [i.to_dict() for i in order.items],
        }
    })
