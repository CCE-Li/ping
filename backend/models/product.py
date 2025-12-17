from db import db


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False, default=0.0)
    image = db.Column(db.String(500), nullable=True)
    stock = db.Column(db.Integer, nullable=False, default=0)
    rating = db.Column(db.Float, nullable=True)

    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=True, index=True)
    category = db.relationship("Category", back_populates="products")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "description": self.description,
            "image": self.image,
            "stock": self.stock,
            "rating": self.rating,
            "category": self.category.name.lower() if self.category else None,
            "category_id": self.category_id,
        }
