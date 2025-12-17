import time

from flask import Blueprint, jsonify, request

from services.ai_service import get_ai_reply
from state import chat_records, online_service

ai_bp = Blueprint("ai", __name__)


# ---------------------- 智能客服接口 ----------------------
@ai_bp.route("/api/ai_chat", methods=["POST"])
def ai_chat():
    """接收用户消息，调用TraeCN API返回智能回复"""
    data = request.get_json()
    user_id = data.get("user_id")  # 学生用户ID
    user_msg = data.get("msg")     # 用户消息
    if not user_id or not user_msg:
        return jsonify({"code": 400, "msg": "参数缺失"})

    # 获取智能回复
    ai_reply = get_ai_reply(user_msg, user_id)

    # 判断是否需要转接人工
    need_transfer = "转接人工客服" in ai_reply or "人工客服" in user_msg

    return jsonify({
        "code": 200,
        "ai_reply": ai_reply,
        "need_transfer": need_transfer,
        "chat_records": chat_records.get(user_id, [])
    })


# ---------------------- 人工客服接口 ----------------------
@ai_bp.route("/api/transfer_service", methods=["POST"])
def transfer_service():
    """转接人工客服（简易版：加入排队列表）"""
    data = request.get_json()
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"code": 400, "msg": "用户ID缺失"})

    # 1. 检查客服状态
    if online_service["status"] != "online":
        return jsonify({"code": 200, "msg": "当前人工客服离线，请稍后再试", "queue_num": -1})

    # 2. 加入排队列表
    if user_id not in online_service["queue"]:
        online_service["queue"].append(user_id)
    queue_num = online_service["queue"].index(user_id) + 1  # 排队序号

    return jsonify({
        "code": 200,
        "msg": f"已转接人工客服，你当前排队序号：{queue_num}",
        "queue_num": queue_num,
        "service_status": online_service["status"]
    })


@ai_bp.route("/api/service_reply", methods=["POST"])
def service_reply():
    """人工客服回复消息（客服端调用）"""
    data = request.get_json()
    user_id = data.get("user_id")
    service_msg = data.get("service_msg")
    if not user_id or not service_msg:
        return jsonify({"code": 400, "msg": "参数缺失"})

    # 记录人工客服回复
    if user_id not in chat_records:
        chat_records[user_id] = []
    chat_records[user_id].append({
        "role": "service", "content": service_msg, "time": time.strftime("%Y-%m-%d %H:%M:%S")
    })

    # 回复后移出排队列表
    if user_id in online_service["queue"]:
        online_service["queue"].remove(user_id)

    return jsonify({
        "code": 200,
        "service_msg": service_msg,
        "chat_records": chat_records[user_id]
    })


@ai_bp.route("/api/get_queue", methods=["GET"])
def get_queue():
    """获取当前排队用户列表（客服端调用）"""
    return jsonify({
        "code": 200,
        "queue": online_service["queue"],
        "queue_length": len(online_service["queue"]),
        "service_status": online_service["status"]
    })
