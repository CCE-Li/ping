import time

from db import db


class UserProfile(db.Model):
    __tablename__ = "user_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True, index=True)

    nickname = db.Column(db.String(64), nullable=True)
    phone = db.Column(db.String(32), nullable=True)
    avatar = db.Column(db.String(500), nullable=True)
    gender = db.Column(db.String(16), nullable=True)
    bio = db.Column(db.String(255), nullable=True)

    updated_at = db.Column(db.Integer, nullable=False, default=lambda: int(time.time()))

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "nickname": self.nickname,
            "phone": self.phone,
            "avatar": self.avatar,
            "gender": self.gender,
            "bio": self.bio,
            "updated_at": self.updated_at,
        }
