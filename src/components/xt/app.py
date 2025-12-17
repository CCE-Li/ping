import eventlet

eventlet.monkey_patch()

from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# 存储聊天记录
chat_history = []

@app.route('/page1')
def page1():
    return render_template('page1.html')

@app.route('/page2')
def page2():
    return render_template('page2.html')

# 获取聊天记录
@app.route('/chat_history')
def get_chat_history():
    return jsonify(chat_history)

# 监听page1发往page2的消息
@socketio.on('send_message_to_page2')
def handle_message_to_page2(data):
    message = data['message']
    # 保存消息到聊天记录
    chat_history.append({'sender': '页面1', 'message': message, 'time': data['time'], 'type': 'page1_to_page2'})
    # 转发消息给page2，附带发送者信息
    socketio.emit('receive_from_page1', {'sender': '页面1', 'message': message, 'time': data['time']})
    print(f"页面1 → 页面2: {message}")

# 监听page2发往page1的消息
@socketio.on('send_message_to_page1')
def handle_message_to_page1(data):
    message = data['message']
    # 保存消息到聊天记录
    chat_history.append({'sender': '页面2', 'message': message, 'time': data['time'], 'type': 'page2_to_page1'})
    # 转发消息给page1，附带发送者信息
    socketio.emit('receive_from_page2', {'sender': '页面2', 'message': message, 'time': data['time']})
    print(f"页面2 → 页面1: {message}")

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)