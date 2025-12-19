import time

from werkzeug.security import check_password_hash, generate_password_hash

from db import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False, index=True)
    created_at = db.Column(db.Integer, nullable=False, default=lambda: int(time.time()))

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_public_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "is_admin": bool(self.is_admin),
            "created_at": self.created_at,
        }
