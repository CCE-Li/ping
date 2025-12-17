import json
import os
import time

from config import MESSAGE_LOG_FILE


# 4. 消息记录功能
def load_messages():
    """加载消息记录"""
    if os.path.exists(MESSAGE_LOG_FILE):
        try:
            with open(MESSAGE_LOG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"加载消息记录失败: {str(e)}")
    return []


def save_message(message):
    """保存单条消息记录"""
    messages = load_messages()
    messages.append(message)
    # 只保留最近1000条消息
    if len(messages) > 1000:
        messages = messages[-1000:]
    try:
        with open(MESSAGE_LOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(messages, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"保存消息记录失败: {str(e)}")
        return False


def log_wechat_message(user_id, content, reply_content, message_type="text"):
    """记录微信消息"""
    message = {
        "user_id": user_id,
        "content": content,
        "reply_content": reply_content,
        "message_type": message_type,
        "timestamp": int(time.time())
    }
    return save_message(message)
