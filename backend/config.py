#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
"""
大学购物平台智能客服系统 - 配置文件
请根据实际情况修改以下配置
"""

# ---------------------- 微信公众号配置 ----------------------
WECHAT_TOKEN = "your_wechat_token"  # 微信公众平台设置的Token
APPID = "your_appid"  # 公众号后台复制
APPSECRET = "your_appsecret"  # 公众号后台复制

# ---------------------- AI服务配置 ----------------------
# 方案1：TRAE IDE 内置 AI 服务（无需外部配置，推荐）
# 无需外部API密钥，直接使用IDE内置的AI模型
# TRAE IDE会自动生成本地调用地址和密钥
TRAE_IDE_API_URL = "http://localhost:8001/v1/chat/completions"  # TRAE IDE内置服务地址（修改为不同端口避免冲突）
TRAE_IDE_API_KEY = "your_trae_ide_api_key"  # TRAE IDE生成的API密钥

# 方案2：字节火山方舟平台（替代TraeCN）
# 访问：https://www.volcengine.com/product/ark 注册并获取密钥
VOLC_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"  # 火山方舟API地址
VOLC_API_KEY = "your_volc_api_key"  # 火山方舟Access Key
VOLC_SECRET_KEY = "your_volc_secret_key"  # 火山方舟Secret Key

# 方案3：原TraeCN平台（已废弃，建议切换到方案1或2）
# 请登录 https://developer.traecn.com/ 获取API密钥
TRAE_API_KEY = "your_traecn_api_key"  # 替换为您的TraeCN API Key
TRAE_SECRET_KEY = "your_traecn_secret_key"  # 替换为您的TraeCN Secret Key
TRAE_API_URL = "https://api.traecn.com/v1/chat/completions"  # TraeCN API地址

# 选择使用的AI服务方案（1:TRAE IDE内置, 2:火山方舟, 3:TraeCN）
AI_SERVICE_SCHEME = 1

# ---------------------- 系统配置 ----------------------
DEBUG = True  # 开发模式，生产环境请设置为False
HOST = "0.0.0.0"  # 监听地址
PORT = 8000  # 服务端口

# ---------------------- 消息记录配置 ----------------------
MESSAGE_LOG_FILE = "wechat_messages.json"  # 消息记录文件路径

# ---------------------- 人工客服配置 ----------------------
SERVICE_STATUS = "online"  # 客服状态: online/offline
MAX_QUEUE_LENGTH = 10  # 最大排队人数

# ---------------------- 数据库配置 ----------------------
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1") #数据库地址
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306")) #端口
MYSQL_USER = os.getenv("MYSQL_USER", "root") #你的数据库账号
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "liyixin23") # 输入你自己的数库密码
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "shopping_platform") #数据库名称

SQLALCHEMY_DATABASE_URI = os.getenv(
    "SQLALCHEMY_DATABASE_URI",
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4",
)

SQLALCHEMY_TRACK_MODIFICATIONS = False
