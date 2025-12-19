# 人工客服模拟数据（大学项目简易版，实际可对接数据库）
online_service = {"status": "online", "queue": []}  # 客服状态+排队列表
chat_records = {}  # 存储会话记录：{user_id: [{"role": "user/ai/service", "content": "消息", "time": "时间"}]}

# 简易鉴权：保存登录 token 与 user_id 的映射（仅内存，重启后会丢失）
token_to_user_id = {}

# 全局变量用于存储access_token和jsapi_ticket
access_token = None
access_token_expires = 0
jsapi_ticket = None
jsapi_ticket_expires = 0
