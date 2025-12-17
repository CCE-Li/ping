# 后端接口文档（Flask）

## 通用说明

- Base URL: `http://127.0.0.1:8000`
- 返回格式：大多数接口返回 JSON；微信回调接口会返回 XML。

---

## 1. 健康检查 / 数据库

### 1.1 GET `/api/health`

- **说明**：服务健康检查
- **返回**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "status": "running",
    "service": "wechat-support-api",
    "timestamp": 1730000000
  }
}
```

### 1.2 GET `/api/db/ping`

- **说明**：数据库连通性测试
- **返回**

```json
{ "code": 0, "msg": "success", "data": { "db": "ok" } }
```

### 1.3 POST `/api/db/test_insert`

- **说明**：写入一条测试记录并返回最新记录
- **Body(JSON)**

```json
{ "content": "hello" }
```

- **返回**

```json
{
  "code": 0,
  "msg": "success",
  "data": { "id": 1, "content": "hello", "created_at": 1730000000 }
}
```

---

## 2. 商品 / 分类

### 2.1 GET `/api/categories`

- **说明**：获取分类列表
- **返回**

```json
{ "success": true, "data": [ { "id": 1, "name": "..." } ] }
```

### 2.2 GET `/api/products`

- **说明**：分页获取商品列表（可按分类筛选）
- **Query**

- `page`：页码，默认 `1`
- `category_id`：分类ID，可选

- **返回**

```json
{
  "success": true,
  "count": 123,
  "results": [ { "id": 1, "name": "..." } ]
}
```

### 2.3 GET `/api/products/<product_id>`

- **说明**：获取单个商品详情
- **Path**

- `product_id`：商品ID（int）

- **成功返回**

```json
{ "success": true, "data": { "id": 1, "name": "..." } }
```

- **失败返回**（404）

```json
{ "success": false, "error": "Product not found" }
```

### 2.4 GET `/api/categories/<category_name>/products`

- **说明**：按分类名（小写匹配）获取商品
- **Path**

- `category_name`：分类名（string）

- **返回**

```json
{ "success": true, "data": [ { "id": 1, "name": "..." } ] }
```

---

## 3. AI 智能客服 / 人工客服

### 3.1 POST `/api/ai_chat`

- **说明**：智能客服对话
- **Body(JSON)**

```json
{ "user_id": "u1", "msg": "怎么下单" }
```

- **返回**

```json
{
  "code": 200,
  "ai_reply": "...",
  "need_transfer": false,
  "chat_records": []
}
```

### 3.2 POST `/api/transfer_service`

- **说明**：转接人工客服（加入排队）
- **Body(JSON)**

```json
{ "user_id": "u1" }
```

- **返回**

```json
{
  "code": 200,
  "msg": "已转接人工客服，你当前排队序号：1",
  "queue_num": 1,
  "service_status": "online"
}
```

### 3.3 POST `/api/service_reply`

- **说明**：人工客服回复（客服端调用）
- **Body(JSON)**

```json
{ "user_id": "u1", "service_msg": "你好，我是客服" }
```

- **返回**

```json
{ "code": 200, "service_msg": "你好，我是客服", "chat_records": [] }
```

### 3.4 GET `/api/get_queue`

- **说明**：获取当前排队列表（客服端调用）
- **返回**

```json
{ "code": 200, "queue": ["u1"], "queue_length": 1, "service_status": "online" }
```

---

## 4. 微信

### 4.1 POST `/api/wechat/test-reply`

- **说明**：前端调试用测试回复
- **Body(JSON)**

```json
{ "message": "怎么下单" }
```

- **返回**

```json
{
  "code": 0,
  "msg": "success",
  "data": { "reply": "...", "is_custom": false }
}
```

### 4.2 GET `/api/wechat/jsapi`

- **说明**：生成微信 JS-SDK 签名
- **Query**

- `url`：当前页面完整 URL（必填）

- **返回**

```json
{ "code": 0, "data": { "appId": "...", "timestamp": 1730000000, "nonceStr": "...", "signature": "..." } }
```

### 4.3 GET|POST `/api/wechat`

- **GET 说明**：微信服务器 URL 校验
- **GET Query**：`signature`、`timestamp`、`nonce`、`echostr`
- **POST 说明**：微信消息回调
  - 请求体为 XML
  - **响应体为 XML**（`Content-Type: application/xml`）

### 4.4 GET `/api/wechat/messages`

- **说明**：获取微信消息记录（管理后台）
- **Query**

- `limit`：默认 `50`
- `offset`：默认 `0`
- `user_id`：可选，按用户筛选

- **返回**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "messages": [ { "user_id": "...", "content": "...", "reply_content": "...", "timestamp": 1730000000 } ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

---

## 5. 用户消息中心

### 5.1 GET `/api/messages/<user_id>`

- **说明**：用户消息中心（系统/订单/活动）
- **Path**

- `user_id`：用户ID（string）

- **返回**

```json
{
  "success": true,
  "data": {
    "system": [ { "id": 1, "title": "...", "content": "...", "createTime": "...", "isRead": true } ],
    "order": [ { "id": 1, "title": "...", "content": "...", "createTime": "...", "isRead": true } ],
    "promo": [ { "id": 1, "title": "...", "content": "...", "createTime": "...", "isRead": false } ]
  }
}
```
