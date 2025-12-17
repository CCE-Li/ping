import json
import sys
from pathlib import Path

from app import app
from db import db
from models.category import Category
from models.product import Product
from sqlalchemy import inspect


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


def import_products(*, clear_existing: bool = False) -> None:
    base_dir = Path(__file__).resolve().parent
    default_products_data_file = base_dir.parent / "products_data.json"
    products_data_file = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else default_products_data_file

    with products_data_file.open("r", encoding="utf-8") as f:
        payload = json.load(f)

    products = payload.get("products")
    if not isinstance(products, list):
        products = payload.get("items")
    if not isinstance(products, list):
        raise ValueError("Unsupported JSON format: expected a list under 'products' or 'items'")

    with app.app_context():
        db.create_all()

        inspector = inspect(db.engine)
        expected_product_cols = {
            "id",
            "name",
            "description",
            "price",
            "image",
            "stock",
            "rating",
            "category_id",
        }
        expected_category_cols = {"id", "name", "image"}

        recreate_schema = False
        if inspector.has_table(Product.__tablename__):
            cols = {c["name"] for c in inspector.get_columns(Product.__tablename__)}
            if not expected_product_cols.issubset(cols):
                recreate_schema = True

        if inspector.has_table(Category.__tablename__):
            cols = {c["name"] for c in inspector.get_columns(Category.__tablename__)}
            if not expected_category_cols.issubset(cols):
                recreate_schema = True

        if recreate_schema:
            Product.__table__.drop(db.engine, checkfirst=True)
            Category.__table__.drop(db.engine, checkfirst=True)
            db.create_all()

        if clear_existing:
            Product.query.delete()
            Category.query.delete()
            db.session.commit()

        category_cache: dict[str, Category] = {c.name.lower(): c for c in Category.query.all()}

        for p in products:
            category_key = _infer_category(str(p.get("name", "")))
            category = category_cache.get(category_key)
            if category is None:
                category = Category(name=category_key.capitalize(), image=p.get("image"))
                db.session.add(category)
            db.session.flush()
            category_cache[category_key] = category

            name = (p.get("name") or "").strip()
            if not name:
                continue

            existing = Product.query.filter_by(name=name).first()
            if existing is None:
                existing = Product()

            existing.name = p.get("name")
            existing.description = p.get("description")
            existing.price = float(p.get("price") or 0)
            existing.image = p.get("image")
            existing.stock = int(p.get("stock") or 0)
            existing.rating = float(p.get("rating") or 5.0)
            existing.category_id = category.id

            db.session.add(existing)

        db.session.commit()


if __name__ == "__main__":
    import_products(clear_existing=False)
    print("import done")
