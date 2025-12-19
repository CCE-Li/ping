from flask import Flask, jsonify
from flask_cors import CORS
import os

from sqlalchemy import inspect, text

from db import db
from routes.health import health_bp
from routes.products import products_bp
from routes.ai import ai_bp
from routes.wechat import wechat_bp
from routes.auth import auth_bp
from routes.user import user_bp
from routes.orders import orders_bp
from routes.admin import admin_bp
from services.messages import save_message

# 确保模型在 db.create_all() 前被加载
from models.user import User  # noqa: F401
from models.category import Category  # noqa: F401
from models.product import Product  # noqa: F401
from models.user_profile import UserProfile  # noqa: F401
from models.auth_token import AuthToken  # noqa: F401
from models.order import Order  # noqa: F401
from models.order_item import OrderItem  # noqa: F401

# 导入配置文件
from config import *

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = SQLALCHEMY_TRACK_MODIFICATIONS
db.init_app(app)


# 禁用Flask的斜杠重定向功能，允许不带斜杠的URL
app.url_map.strict_slashes = False
# 启用更宽松的CORS支持，解决前端跨域问题
CORS(app, resources={r"/*": {"origins": "*"}})

# 也可以添加响应头确保跨域正常工作
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response


app.register_blueprint(health_bp)
app.register_blueprint(products_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(wechat_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(admin_bp)


# 配置已从config.py导入

# 用户消息中心接口 - 用于前端消息列表展示
@app.route('/api/messages/<user_id>', methods=['GET'])
def get_user_messages(user_id):
    """获取用户的消息列表（系统消息、订单消息、活动消息）"""
    try:
        # 模拟消息数据（实际项目中应从数据库获取）
        system_messages = [
            {
                "id": 1,
                "title": "系统通知",
                "content": "尊敬的用户，您的账号已成功注册",
                "createTime": "2025-11-01 14:30:00",
                "isRead": True
            },
            {
                "id": 2,
                "title": "系统维护通知",
                "content": "系统将于11月5日凌晨2点进行维护，届时服务可能暂时不可用",
                "createTime": "2025-11-03 10:00:00",
                "isRead": False
            },
            {
                "id": 3,
                "title": "账号安全提醒",
                "content": "您的账号在新设备登录，如非本人操作，请及时修改密码",
                "createTime": "2025-11-04 08:15:00",
                "isRead": True
            }
        ]
        
        order_messages = [
            {
                "id": 1,
                "title": "订单发货通知",
                "content": "您的订单#202511010001已发货，快递公司：顺丰速运，运单号：SF1234567890",
                "createTime": "2025-11-02 16:45:00",
                "isRead": True
            },
            {
                "id": 2,
                "title": "订单支付成功",
                "content": "您的订单#202511030002已支付成功，商家正在处理中",
                "createTime": "2025-11-03 14:20:00",
                "isRead": False
            },
            {
                "id": 3,
                "title": "订单已完成",
                "content": "您的订单#202510280001已完成，感谢您的购买",
                "createTime": "2025-11-01 10:30:00",
                "isRead": True
            }
        ]
        
        promo_messages = [
            {
                "id": 1,
                "title": "限时优惠活动",
                "content": "双11大促开始啦！全场商品5折起，满199减100，快来选购吧！",
                "createTime": "2025-11-04 09:00:00",
                "isRead": False
            },
            {
                "id": 2,
                "title": "新用户专享",
                "content": "欢迎新用户！注册即送50元优惠券，满100元即可使用",
                "createTime": "2025-11-01 14:35:00",
                "isRead": True
            },
            {
                "id": 3,
                "title": "会员积分提醒",
                "content": "您的会员积分已到账，当前积分：1500，可用于兑换精美礼品",
                "createTime": "2025-11-03 11:10:00",
                "isRead": False
            }
        ]
        
        # 返回符合前端预期的结构
        return jsonify({
            "success": True,
            "data": {
                "system": system_messages,
                "order": order_messages,
                "promo": promo_messages
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"获取消息失败: {str(e)}"
        })

if __name__ == "__main__":
    # 初始化消息记录文件
    if not os.path.exists(MESSAGE_LOG_FILE):
        save_message([])
    with app.app_context():
        try:
            inspector = inspect(db.engine)
            if inspector.has_table("users"):
                cols = {c.get("name") for c in inspector.get_columns("users")}
                if "is_admin" not in cols:
                    try:
                        db.session.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0"))
                        db.session.execute(text("CREATE INDEX ix_users_is_admin ON users (is_admin)"))
                        db.session.commit()
                    except Exception:
                        db.session.rollback()
                        try:
                            db.session.execute(text("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0"))
                            db.session.commit()
                        except Exception:
                            db.session.rollback()
        except Exception:
            db.session.rollback()
        db.create_all()
    # 运行本地服务器
    app.run(host=HOST, port=PORT, debug=DEBUG)
