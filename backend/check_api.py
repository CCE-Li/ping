import requests

try:
    response = requests.get('http://localhost:8000/api/products')
    print('API状态码:', response.status_code)
    print('API响应:', response.json())
except Exception as e:
    print('API请求失败:', str(e))