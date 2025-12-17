import hashlib
import random
import time
import xml.etree.ElementTree as ET

import requests

from config import APPID, APPSECRET
import state


# 4. 微信消息处理（解析XML/回复XML）
def parse_xml(xml_data):
    """解析微信发来的XML消息"""
    root = ET.fromstring(xml_data)
    msg = {}
    for child in root:
        msg[child.tag] = child.text
    return msg


def generate_reply_xml(msg, reply_content):
    """生成微信回复的XML格式"""
    xml_template = """
    <xml>
        <ToUserName><![CDATA[{to_user}]]></ToUserName>
        <FromUserName><![CDATA[{from_user}]]></FromUserName>
        <CreateTime>{create_time}</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[{content}]]></Content>
    </xml>
    """
    return xml_template.format(
        to_user=msg["FromUserName"],
        from_user=msg["ToUserName"],
        create_time=str(int(time.time())),
        content=reply_content
    )


# 获取微信access_token
def get_access_token():
    # 如果access_token未过期，直接返回
    if state.access_token and time.time() < state.access_token_expires:
        return state.access_token

    # 调用微信接口获取access_token
    url = f"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={APPID}&secret={APPSECRET}"
    try:
        response = requests.get(url, timeout=5)
        result = response.json()

        if "access_token" in result:
            state.access_token = result["access_token"]
            # 设置过期时间（微信返回7200秒，我们提前100秒过期）
            state.access_token_expires = time.time() + 7100
            return state.access_token
        else:
            print(f"获取access_token失败: {result}")
            return None
    except Exception as e:
        print(f"获取access_token异常: {e}")
        return None


# 获取微信jsapi_ticket
def get_jsapi_ticket():
    # 如果jsapi_ticket未过期，直接返回
    if state.jsapi_ticket and time.time() < state.jsapi_ticket_expires:
        return state.jsapi_ticket

    # 先获取access_token
    token = get_access_token()
    if not token:
        return None

    # 调用微信接口获取jsapi_ticket
    url = f"https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token={token}&type=jsapi"
    try:
        response = requests.get(url, timeout=5)
        result = response.json()

        if result.get("errcode") == 0:
            state.jsapi_ticket = result["ticket"]
            # 设置过期时间（微信返回7200秒，我们提前100秒过期）
            state.jsapi_ticket_expires = time.time() + 7100
            return state.jsapi_ticket
        else:
            print(f"获取jsapi_ticket失败: {result}")
            return None
    except Exception as e:
        print(f"获取jsapi_ticket异常: {e}")
        return None


def make_jsapi_signature(url: str):
    ticket = get_jsapi_ticket()
    if not ticket:
        return None

    # 生成随机字符串
    nonce_str = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=16))
    # 生成时间戳
    timestamp = str(int(time.time()))

    # 构建签名参数
    sign_params = f"jsapi_ticket={ticket}&noncestr={nonce_str}&timestamp={timestamp}&url={url}"
    # 计算签名
    signature = hashlib.sha1(sign_params.encode("utf-8")).hexdigest()

    return {
        "appId": APPID,
        "timestamp": timestamp,
        "nonceStr": nonce_str,
        "signature": signature,
    }
