# 大学购物平台智能客服系统

## 系统概述

这是一个基于Python Flask框架开发的智能客服系统，专为大学购物平台设计，支持微信公众号接入、智能回复和人工客服切换功能。

## 功能特性

### 1. 智能客服功能
- **自然语言理解**：基于TraeCN API的智能对话系统
- **自定义问答库**：支持购物场景的关键词匹配，提高回复准确性
- **多轮对话**：支持上下文理解的连续对话
- **会话记录**：自动保存用户与AI的对话历史

### 2. 人工客服功能
- **客服转接**：用户可请求转人工客服
- **排队系统**：智能管理客服排队队列
- **客服回复**：支持人工客服直接回复用户
- **状态管理**：实时显示客服在线状态

### 3. 微信公众号支持
- **服务器验证**：支持微信公众号服务器配置
- **消息接收**：接收用户发送的文本消息
- **消息回复**：自动回复用户消息
- **JS-SDK支持**：提供微信分享等功能的签名接口

### 4. 系统管理功能
- **消息记录查询**：支持按用户ID和时间查询对话记录
- **健康检查**：提供系统健康状态接口
- **配置管理**：集中式配置文件，方便维护

## 技术栈

- **后端框架**：Flask 2.0+
- **AI接口**：TraeCN API (默认) / 青云客API (备用)
- **数据库**：JSON文件存储 (支持扩展到MySQL/MongoDB)
- **微信开发**：微信公众平台API
- **运行环境**：Python 3.7+

## 安装步骤

### 1. 环境准备

```bash
# 安装Python 3.7+（略）
# 创建虚拟环境
python -m venv .venv

# 激活虚拟环境
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置系统

```bash
# 复制配置文件模板（如果不存在）
cp config.py.example config.py

# 编辑配置文件
# 根据实际情况修改API密钥、微信公众号信息等
```

### 4. 启动服务

```bash
# 开发模式启动
python app.py

# 生产环境建议使用Gunicorn
# gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## 配置说明

### 主要配置项

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| WECHAT_TOKEN | 微信公众平台Token | your_wechat_token |
| APPID | 微信公众号APPID | your_appid |
| APPSECRET | 微信公众号APPSECRET | your_appsecret |
| TRAE_API_KEY | TraeCN API Key | your_traecn_api_key |
| TRAE_SECRET_KEY | TraeCN Secret Key | your_traecn_secret_key |
| TRAE_API_URL | TraeCN API地址 | https://api.traecn.com/v1/chat/completions |
| HOST | 服务器监听地址 | 0.0.0.0 |
| PORT | 服务器端口 | 8000 |
| DEBUG | 调试模式 | True |
| MESSAGE_LOG_FILE | 消息记录文件路径 | wechat_messages.json |
| SERVICE_STATUS | 客服状态 | online |
| MAX_QUEUE_LENGTH | 最大排队人数 | 10 |

### 获取TraeCN API密钥

1. 访问 [TraeCN开发者平台](https://developer.traecn.com/)
2. 注册/登录账号
3. 进入「应用管理」页面
4. 创建新应用，命名为「大学购物平台客服」
5. 复制生成的API Key和Secret Key
6. 将密钥粘贴到config.py文件中

### 微信公众号配置

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「设置与开发」-「基本配置」
3. 配置服务器信息：
   - URL：`http://your-domain.com/api/wechat`
   - Token：与config.py中的WECHAT_TOKEN一致
   - 消息加解密方式：明文模式（或根据需求选择）
4. 保存配置并启用

## API接口文档

### 1. 智能客服接口

```
POST /api/ai_chat
```

**请求参数**：
- user_id: 用户ID
- msg: 用户消息

**响应示例**：
```json
{
  "code": 200,
  "ai_reply": "您好，请问有什么可以帮助您的吗？",
  "need_transfer": false,
  "chat_records": [
    {
      "role": "user",
      "content": "商品多少钱？",
      "time": "2023-12-25 14:30:00"
    },
    {
      "role": "ai",
      "content": "我们的商品价格从99元到299元不等，具体看款式哦～",
      "time": "2023-12-25 14:30:01"
    }
  ]
}
```

### 2. 人工客服转接接口

```
POST /api/transfer_service
```

**请求参数**：
- user_id: 用户ID

**响应示例**：
```json
{
  "code": 200,
  "msg": "已转接人工客服，你当前排队序号：1",
  "queue_num": 1,
  "service_status": "online"
}
```

### 3. 人工客服回复接口

```
POST /api/service_reply
```

**请求参数**：
- user_id: 用户ID
- service_msg: 客服回复消息

**响应示例**：
```json
{
  "code": 200,
  "service_msg": "您好，我是人工客服，请问有什么可以帮助您的吗？",
  "chat_records": [
    // 完整的会话记录
  ]
}
```

### 4. 微信消息接口

```
GET/POST /api/wechat
```

**说明**：微信公众号消息接收接口，用于处理微信服务器发送的消息。

### 5. 消息记录查询接口

```
GET /api/wechat/messages
```

**查询参数**：
- user_id: 可选，按用户ID筛选
- page: 可选，分页页码
- limit: 可选，每页记录数

**响应示例**：
```json
{
  "total": 10,
  "page": 1,
  "limit": 10,
  "messages": [
    // 消息记录列表
  ]
}
```

### 6. 健康检查接口

```
GET /api/health
```

**响应示例**：
```json
{
  "status": "ok",
  "timestamp": 1671950400,
  "service": "wechat_support"
}
```

### 7. JS-SDK签名接口

```
GET /api/wechat/jsapi
```

**查询参数**：
- url: 当前页面URL

**响应示例**：
```json
{
  "appId": "your_appid",
  "timestamp": "1671950400",
  "nonceStr": "random_string",
  "signature": "signature_string",
  "url": "current_page_url"
}
```

## 测试使用

### 运行测试脚本

```bash
# 运行综合测试脚本
python test_comprehensive.py

# 运行微信支持测试
python test_wechat_support.py

# 运行API集成测试
python test_api_integration.py
```

### 测试流程

1. 确保后端服务已启动
2. 运行测试脚本
3. 查看测试结果
4. 根据测试结果调整配置

## 常见问题

### 1. TraeCN API调用失败

**解决方法**：
- 检查config.py中的API密钥是否正确
- 确保网络连接正常
- 检查API地址是否正确

### 2. 微信公众号无法接收消息

**解决方法**：
- 检查微信公众平台的服务器配置是否正确
- 确保服务器可以被外部访问
- 检查WECHAT_TOKEN是否一致

### 3. 人工客服功能不工作

**解决方法**：
- 检查online_service配置是否正确
- 确保会话记录存储正常
- 检查排队系统逻辑

## 扩展建议

1. **数据库扩展**：将JSON文件存储替换为MySQL或MongoDB，提高性能和可靠性
2. **客服管理系统**：开发独立的客服管理界面，方便人工客服处理请求
3. **消息推送**：添加微信模板消息功能，推送订单状态等信息
4. **数据分析**：添加用户行为分析功能，优化客服服务
5. **多渠道支持**：扩展支持小程序、APP等多渠道接入

## 许可证

本项目采用MIT许可证，可自由使用和修改。

## 联系我们

如有问题或建议，欢迎通过以下方式联系：
- 邮箱：support@example.com
- 电话：400-123-4567
- 微信：xxxxxx

---

© 2024 大学购物平台智能客服系统
