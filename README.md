# ping - 大学购物平台（前后端分离）
 
 本仓库包含：
 - 前端：`Vue 3 + Vite + Pinia + Vue Router + TailwindCSS + Element Plus`
 - 后端：`Flask + Flask-SQLAlchemy`，提供商品/订单/用户/AI客服/微信相关接口
 - 数据：支持 `MySQL`（默认）或你自定义的 `SQLAlchemy` 连接串；仓库附带 `sql.sql`（MySQL建表脚本）与示例数据文件
 
 ## 目录结构
 
 - **frontend（位于项目根目录）**
   - `src/`：前端业务代码
   - `public/`：静态资源
   - `vite.config.js`：开发代理（`/api -> http://localhost:8000`）
 - **backend**
   - `app.py`：Flask 入口（默认 `http://0.0.0.0:8000`）
   - `config.py`：后端配置（AI/微信/数据库）
   - `routes/`：接口路由
   - `models/`：SQLAlchemy 数据模型
   - `services/`：AI/微信/消息等服务
 - **data & scripts**
   - `sql.sql`：MySQL 初始化脚本（包含建库建表）
   - `products_data.json` / `products_200.json`：商品示例数据
   - `backend/import_products_json_to_db.py`：将 JSON 商品导入数据库的脚本
   - `backend/migrate_sqlite_to_mysql.py`：数据迁移辅助脚本（如有需要）
 
 ## 环境要求
 
 - **Node.js**：建议 `18+`
 - **Python**：建议 `3.10+`（后端依赖在 `backend/requirements.txt`）
 - **数据库**：
   - 推荐 `MySQL 8+`（项目默认配置为 MySQL）
   - 也可以通过环境变量 `SQLALCHEMY_DATABASE_URI` 切换到 SQLite 等其它数据库
 
 ## 快速开始（开发环境）
 
 ### 1) 启动后端（Flask）
 
 在 `backend/` 下创建并激活虚拟环境，然后安装依赖：
 
 ```bash
 python -m venv .venv
 .venv\Scripts\activate
 pip install -r requirements.txt
 ```
 
 启动后端：
 
 ```bash
 python app.py
 ```
 
 后端默认监听：
 - `http://localhost:8000`
 
 ### 2) 初始化数据库（MySQL）
 
 方式 A：直接执行仓库内的 `sql.sql`（推荐）
 
 ```bash
 mysql -u root -p < sql.sql
 ```
 
 方式 B：让后端自动建表
 
 后端启动时会执行 `db.create_all()`，会自动创建表结构（前提是 `SQLALCHEMY_DATABASE_URI` 可用且账号有建表权限）。
 
 ### 3) 导入商品数据（可选）
 
 在项目根目录执行：
 
 ```bash
 python backend/import_products_json_to_db.py
 ```
 
 ### 4) 启动前端（Vite）
 
 在项目根目录：
 
 ```bash
 npm install
 npm run dev
 ```
 
 前端开发服务器启动后，直接访问终端输出的地址（通常为 `http://localhost:5173`）。
 
 ## 前后端联调说明（代理）
 
 本项目已在 `vite.config.js` 中配置开发代理：
 - 前端请求以 `/api` 开头的接口会转发到 `http://localhost:8000`
 - 你在前端调用接口时建议统一使用 `/api/...`
 
 可选：你也可以使用仓库根目录的 `proxy_server.js` 启动一个额外的调试代理（`http://localhost:8081` -> `http://localhost:8000`），它会在控制台输出更详细的请求信息：
 
 ```bash
 node proxy_server.js
 ```
 
 ## 后端配置说明（重要）
 
 后端配置集中在 `backend/config.py`：
 
 - **服务端口**：`PORT = 8000`
 - **AI 服务方案**：`AI_SERVICE_SCHEME`
   - `1`：TRAE IDE 内置（需要本地对应服务）
   - `2`：火山方舟（推荐，读取环境变量 `VOLC_API_URL` / `VOLC_API_KEY` / `VOLC_MODEL`）
   - `3`：TraeCN（已标注为不建议）
 - **数据库**：默认从环境变量 `SQLALCHEMY_DATABASE_URI` 读取，未设置则走 MySQL 拼接配置
 
 建议通过环境变量覆盖敏感信息（不要把真实密钥/数据库密码提交到仓库）：
 
 ```bash
 set SQLALCHEMY_DATABASE_URI=mysql+pymysql://USER:PASSWORD@127.0.0.1:3306/shopping_platform?charset=utf8mb4
 set VOLC_API_KEY=你的KEY
 set VOLC_MODEL=你的模型或Endpoint
 ```
 
 ## 接口文档
 
 后端更完整的接口说明见：
 - `backend/README.md`
 
 ## 常见问题
 
 ### 1) 前端请求 404 / 502
 
 - 确认后端已启动：在 `backend/` 下运行 `python app.py`（或在根目录运行 `python backend/app.py`）
 - 确认前端请求路径以 `/api` 开头（以便 Vite 代理生效）
 
 ### 2) 数据库连接失败
 
 - 确认 MySQL 服务已启动、账号密码正确
 - 推荐设置环境变量 `SQLALCHEMY_DATABASE_URI` 以避免修改代码
 - 若你执行了 `sql.sql`，数据库名默认是 `shopping_platform`
 
 ### 3) AI 接口调用失败
 
 - 使用火山方舟方案时，确认 `VOLC_API_KEY` / `VOLC_MODEL` 已正确设置
 - 若本地无 TRAE IDE 内置服务，请不要把 `AI_SERVICE_SCHEME` 设为 `1`
 
 ## 构建与部署（前端）
 
 ```bash
 npm run build
 npm run preview
 ```
