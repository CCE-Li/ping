import time

from db import db


class AuthToken(db.Model):
    __tablename__ = "auth_tokens"

    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(128), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    created_at = db.Column(db.Integer, nullable=False, default=lambda: int(time.time()))

    def to_dict(self) -> dict:
        return {
            "token": self.token,
            "user_id": self.user_id,
            "created_at": self.created_at,
        }
