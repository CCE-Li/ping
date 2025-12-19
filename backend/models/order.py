import time

from db import db


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    recipient = db.Column(db.String(64), nullable=False)
    phone = db.Column(db.String(32), nullable=False)
    address = db.Column(db.String(255), nullable=False)

    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(32), nullable=False, default="pending")

    created_at = db.Column(db.Integer, nullable=False, default=lambda: int(time.time()))

    items = db.relationship("OrderItem", back_populates="order", cascade="all, delete-orphan", lazy=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "recipient": self.recipient,
            "phone": self.phone,
            "address": self.address,
            "total_amount": self.total_amount,
            "status": self.status,
            "created_at": self.created_at,
        }
