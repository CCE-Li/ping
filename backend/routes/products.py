from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from db import db
from models.category import Category
from models.product import Product

products_bp = Blueprint("products", __name__)


@products_bp.route("/api/categories", methods=["GET"])
def get_categories():
    categories = Category.query.order_by(Category.id.asc()).all()
    return jsonify({"success": True, "data": [c.to_dict() for c in categories]})


@products_bp.route("/api/products", methods=["GET"])
def get_products():
    page = request.args.get("page", 1, type=int)
    category_id = request.args.get("category_id", None, type=int)
    keyword = request.args.get("keyword", "", type=str) or request.args.get("q", "", type=str)
    per_page = request.args.get("per_page", 10, type=int)

    if per_page <= 0:
        per_page = 10
    if per_page > 200:
        per_page = 200

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


@products_bp.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get(product_id)
    if product:
        return jsonify({"success": True, "data": product.to_dict()})

    return jsonify({"success": False, "error": "Product not found"}), 404


@products_bp.route("/api/categories/<string:category_name>/products", methods=["GET"])
def get_products_by_category(category_name):
    category = Category.query.filter(db.func.lower(Category.name) == category_name.lower()).first()
    if category is None:
        return jsonify({"success": True, "data": []})

    products = Product.query.filter(Product.category_id == category.id).order_by(Product.id.desc()).all()
    return jsonify({"success": True, "data": [p.to_dict() for p in products]})
