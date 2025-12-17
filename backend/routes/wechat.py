import hashlib
import time

from flask import Blueprint, jsonify, make_response, request

from config import WECHAT_TOKEN
from services.ai_service import SHOP_QA, get_ai_reply
from services.messages import load_messages, log_wechat_message
from services.wechat_service import generate_reply_xml, make_jsapi_signature, parse_xml
from state import chat_records, online_service

wechat_bp = Blueprint("wechat", __name__)


# 测试回复接口（用于前端调试）
@wechat_bp.route('/api/wechat/test-reply', methods=['POST'])
def test_reply():
    try:
        data = request.json
        message = data.get('message', '')

        # 先检查购物场景自定义问答
        reply = None
        is_custom = False

        # 检查是否匹配自定义问答
        for key, answer in SHOP_QA.items():
            if key in message:
                reply = answer
                is_custom = True
                break

        if not reply:
            # 使用青云客智能回复
            reply = get_ai_reply(message)

        return jsonify({
            'code': 0,
            'msg': 'success',
            'data': {
                'reply': reply,
                'is_custom': is_custom
            }
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'msg': f'测试回复失败: {str(e)}',
            'data': {}
        })


# 生成微信JS-SDK签名
@wechat_bp.route('/api/wechat/jsapi', methods=['GET'])
def get_jsapi_signature():
    url = request.args.get('url')
    if not url:
        return jsonify({'code': 400, 'msg': '缺少url参数'})

    data = make_jsapi_signature(url)
    if not data:
        return jsonify({'code': 500, 'msg': '获取jsapi_ticket失败'})

    return jsonify({'code': 0, 'data': data})


# 5. 微信接口验证+消息接收
@wechat_bp.route('/api/wechat', methods=['GET', 'POST'])
def wechat_handler():
    # GET请求：微信验证服务器地址
    if request.method == 'GET':
        signature = request.args.get('signature')
        timestamp = request.args.get('timestamp')
        nonce = request.args.get('nonce')
        echostr = request.args.get('echostr')

        # 验证签名
        temp_list = [WECHAT_TOKEN, timestamp, nonce]
        temp_list.sort()
        temp_str = ''.join(temp_list).encode('utf-8')
        hash_str = hashlib.sha1(temp_str).hexdigest()

        if hash_str == signature:
            return echostr
        return '验证失败'

    # POST请求：处理用户发送的消息
    xml_data = request.data
    msg = parse_xml(xml_data)
    user_id = msg['FromUserName']

    # 只处理文本消息（购物客服核心）
    if msg['MsgType'] == 'text':
        question = msg['Content'].strip()

        # 检查是否需要人工客服
        if '人工客服' in question or user_id in online_service['queue']:
            # 加入排队列表
            if user_id not in online_service['queue']:
                online_service['queue'].append(user_id)
            queue_num = online_service['queue'].index(user_id) + 1
            reply_content = f'已为你转接人工客服，当前排队序号：{queue_num}，客服将尽快为你服务～'

            # 记录人工客服请求
            if user_id not in chat_records:
                chat_records[user_id] = []
            chat_records[user_id].append({
                'role': 'user', 'content': question, 'time': time.strftime('%Y-%m-%d %H:%M:%S')
            })
            chat_records[user_id].append({
                'role': 'service', 'content': reply_content, 'time': time.strftime('%Y-%m-%d %H:%M:%S')
            })
        else:
            # 调用智能客服
            reply_content = get_ai_reply(question, user_id)

            # 检查是否需要转接人工
            if '转接人工客服' in reply_content:
                if user_id not in online_service['queue']:
                    online_service['queue'].append(user_id)
                queue_num = online_service['queue'].index(user_id) + 1
                reply_content = f'该问题我无法解答，已为你转接人工客服，当前排队序号：{queue_num}，客服将尽快为你服务～'

        # 记录消息
        log_wechat_message(
            user_id=user_id,
            content=question,
            reply_content=reply_content,
            message_type='text'
        )

        reply_xml = generate_reply_xml(msg, reply_content)
        response = make_response(reply_xml)
        response.headers['Content-Type'] = 'application/xml'
        return response

    # 非文本消息（图片/语音）回复提示
    reply_content = '暂不支持图片/语音咨询哦，你可以文字问我商品、下单、售后的问题～'

    # 记录消息
    log_wechat_message(
        user_id=user_id,
        content='[非文本消息]',
        reply_content=reply_content,
        message_type=msg['MsgType']
    )

    reply_xml = generate_reply_xml(msg, reply_content)
    response = make_response(reply_xml)
    response.headers['Content-Type'] = 'application/xml'
    return response


# 获取消息记录接口（用于管理后台）
@wechat_bp.route('/api/wechat/messages', methods=['GET'])
def get_messages():
    try:
        # 获取查询参数
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        user_id = request.args.get('user_id')

        messages = load_messages()

        # 按用户ID筛选
        if user_id:
            messages = [msg for msg in messages if msg['user_id'] == user_id]

        # 按时间倒序排序
        messages.sort(key=lambda x: x['timestamp'], reverse=True)

        # 分页
        total = len(messages)
        paginated_messages = messages[offset:offset + limit]

        return jsonify({
            'code': 0,
            'msg': 'success',
            'data': {
                'messages': paginated_messages,
                'total': total,
                'limit': limit,
                'offset': offset
            }
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'msg': f'获取消息记录失败: {str(e)}',
            'data': {}
        })
