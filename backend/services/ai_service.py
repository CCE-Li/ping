import time
import requests

from config import (
    AI_SERVICE_SCHEME,
    TRAE_IDE_API_URL,
    TRAE_IDE_API_KEY,
    VOLC_API_URL,
    VOLC_API_KEY,
    VOLC_MODEL,
    TRAE_API_URL,
    TRAE_API_KEY,
    TRAE_SECRET_KEY,
)
from state import chat_records


# 2. 购物场景自定义问答（优先匹配，提高准确性）
SHOP_QA = {
    "商品多少钱": "我们的商品价格从99元到299元不等，具体看款式哦～",
    "怎么下单": "点击公众号菜单的「立即购买」，选择商品后填写收货地址即可下单～",
    "包邮吗": "满99元全国包邮，不满的话运费8元哦～",
    "售后怎么处理": "签收后7天内无理由退货，质量问题包运费，联系人工客服即可处理～",
    "人工客服": "请留下你的问题和联系方式，客服会在1小时内回复你～",
    "如何购买": "点击商品详情页的「立即购买」按钮，按照提示完成支付即可",
    "如何购买商品": "点击商品详情页的「立即购买」按钮，按照提示完成支付即可",
    "退货政策": "签收后7天内无理由退货，15天内质量问题包退换，退货时商品需保持完好，不影响二次销售～",
    "配送时间": "我们的配送时间为工作日9:00-18:00，通常下单后24小时内发货",
    "客服热线": "您可以拨打我们的客服热线：400-123-4567",
    "订单查询": "您可以在「个人中心」-「我的订单」中查询订单状态",
    "支付方式": "我们支持微信支付、支付宝、银行卡等多种支付方式",
    "优惠券使用": "在结算页面选择可用优惠券，系统将自动抵扣金额",
    "物流查询": "您可以在订单详情页点击「查看物流」获取最新物流信息",
    "商品质量": "我们的商品均经过严格质检，质量有保障，请放心购买",
    "发票开具": "下单时可以选择开具发票，我们会随商品一起寄出",
    "缺货怎么办": "如果商品缺货，您可以选择等待补货或申请退款，我们会尽快处理",
    "修改订单": "下单后10分钟内可以修改订单信息，超过时间请联系客服处理",
    "取消订单": "未发货的订单可以在「我的订单」中直接取消，已发货的订单需要联系客服处理",
    "自提点在哪里": "我们在学校各个校区都设有自提点，具体位置可以在公众号菜单的「自提点查询」中查看～",
    "退货怎么操作": "退货流程：1. 在「我的订单」中找到对应订单；2. 点击「申请退货」；3. 填写退货原因并上传照片；4. 等待审核通过后寄回商品；5. 收到商品后退款到原支付账户～",
    "自提点营业时间": "自提点营业时间为周一至周日的9:00-18:00，节假日正常营业～",
    "怎么查询自提点": "在公众号菜单点击「自提点查询」，选择校区即可查看该校区所有自提点的位置和营业时间～",
    "自提点可以存放多久": "自提点可以存放3天，超过时间未取的商品会被退回仓库～",
    "忘记取货码怎么办": "可以在订单详情页面重新获取取货码，或者联系自提点工作人员核实身份后取货～",
}


# 3. 对接对话API（智能客服+人工客服切换）
def get_ai_reply(question, user_id=None):
    # 先匹配自定义购物问答（支持关键词匹配）
    for key, reply in SHOP_QA.items():
        if key in question:
            # 记录会话
            if user_id:
                if user_id not in chat_records:
                    chat_records[user_id] = []
                chat_records[user_id].append({
                    "role": "user", "content": question, "time": time.strftime("%Y-%m-%d %H:%M:%S")
                })
                chat_records[user_id].append({
                    "role": "ai", "content": reply, "time": time.strftime("%Y-%m-%d %H:%M:%S")
                })
            return reply

    # 匹配不到则调用AI服务
    try:
        # 拼接详细的Prompt指令+用户消息
        prompt = f"""
        # 角色定义
        你是【XX大学购物平台】的智能客服，仅解答该平台相关问题，拒绝无关话题（如娱乐、时政）。
        # 核心职责
        1. 解答商品相关：商品库存、价格、规格（如校园文创、零食、日用品）、学生专属折扣；
        2. 解答订单相关：下单流程、取消订单、退款规则（7天无理由，校园自提点退货）；
        3. 解答配送相关：校园自提点位置（XX教学楼1楼/XX宿舍楼下）、配送时间（工作日10:00-21:00）、学生认证后免配送费规则；
        4. 解答账号相关：学生认证流程（上传学生证）、密码找回、收货地址绑定校园卡；
        # 回复规则
        1. 语气亲切，符合大学生沟通风格，避免官方话术，禁用专业术语；
        2. 无法解答时，明确提示\"该问题我无法解答，将为你转接人工客服\"，并触发人工客服转接逻辑；
        3. 回复长度控制在50字以内，简洁易懂；
        # 禁用场景
        拒绝解答：平台外商品推荐、违法违规问题、与校园购物无关的闲聊。

        用户问题：{question}
        """

        # 根据选择的AI服务方案配置请求参数
        if AI_SERVICE_SCHEME == 1:  # 方案1：TRAE IDE内置AI服务
            api_url = TRAE_IDE_API_URL
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {TRAE_IDE_API_KEY}"
            }
            api_data = {
                "model": "trae-7b-chat",  # 与TraeCN兼容的模型名称
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 200
            }
        elif AI_SERVICE_SCHEME == 2:  # 方案2：字节火山方舟
            api_url = VOLC_API_URL
            if not VOLC_API_KEY:
                raise RuntimeError("VOLC_API_KEY 未配置，请设置环境变量 VOLC_API_KEY")
            if not VOLC_MODEL:
                raise RuntimeError("VOLC_MODEL 未配置，请设置环境变量 VOLC_MODEL（控制台创建推理接入点 Endpoint 后获得）")
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {VOLC_API_KEY}",
            }
            api_data = {
                "model": VOLC_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 200
            }
        else:  # 方案3：原TraeCN平台（已废弃）
            api_url = TRAE_API_URL
            headers = {
                "Content-Type": "application/json",
                "API-Key": TRAE_API_KEY,
                "Secret-Key": TRAE_SECRET_KEY
            }
            api_data = {
                "model": "trae-7b-chat",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 200
            }

        res = requests.post(api_url, headers=headers, json=api_data, timeout=10)
        res.raise_for_status()
        payload = res.json() if res.content else {}
        ai_reply = (((payload.get("choices") or [{}])[0]).get("message") or {}).get("content")
        if not ai_reply:
            raise RuntimeError(f"AI 服务返回异常: {payload}")
        ai_reply = ai_reply.strip()

        # 记录会话
        if user_id:
            if user_id not in chat_records:
                chat_records[user_id] = []
            chat_records[user_id].append({
                "role": "user", "content": question, "time": time.strftime("%Y-%m-%d %H:%M:%S")
            })
            chat_records[user_id].append({
                "role": "ai", "content": ai_reply, "time": time.strftime("%Y-%m-%d %H:%M:%S")
            })

        return ai_reply

    except Exception as e:
        print(f"对话API调用失败: {str(e)}")
        # 如果新API调用失败，回退到青云客接口
        try:
            url = f"http://api.qingyunke.com/api.php?key=free&appid=0&msg={question}"
            res = requests.get(url, timeout=5)
            fallback_reply = res.json()["content"].replace("{br}", "\n")

            # 记录会话
            if user_id:
                if user_id not in chat_records:
                    chat_records[user_id] = []
                chat_records[user_id].append({
                    "role": "user", "content": question, "time": time.strftime("%Y-%m-%d %H:%M:%S")
                })
                chat_records[user_id].append({
                    "role": "ai", "content": fallback_reply, "time": time.strftime("%Y-%m-%d %H:%M:%S")
                })

            return fallback_reply
        except Exception:
            error_reply = "抱歉我还不太懂这个问题，你可以问「人工客服」哦～"

            # 记录会话
            if user_id:
                if user_id not in chat_records:
                    chat_records[user_id] = []
                chat_records[user_id].append({
                    "role": "user", "content": question, "time": time.strftime("%Y-%m-%d %H:%M:%S")
                })
                chat_records[user_id].append({
                    "role": "ai", "content": error_reply, "time": time.strftime("%Y-%m-%d %H:%M:%S")
                })

            return error_reply
