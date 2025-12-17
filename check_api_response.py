import requests
import json

def check_api_endpoints():
    print("=== 检查API端点 ===")
    
    # 检查分类API
    print("\n1. 检查分类API (/api/categories):")
    try:
        categories_response = requests.get('http://localhost:8000/api/categories')
        print(f"   状态码: {categories_response.status_code}")
        categories_data = categories_response.json()
        print(f"   响应类型: {type(categories_data)}")
        print(f"   响应键: {list(categories_data.keys())}")
        for key, value in categories_data.items():
            print(f"   {key} - 类型: {type(value)}")
            if isinstance(value, (list, dict)):
                print(f"   {key} - 内容: {json.dumps(value, indent=2, ensure_ascii=False)[:200]}...")
    except Exception as e:
        print(f"   错误: {str(e)}")
    
    # 检查商品API
    print("\n2. 检查商品API (/api/products):")
    try:
        products_response = requests.get('http://localhost:8000/api/products')
        print(f"   状态码: {products_response.status_code}")
        products_data = products_response.json()
        print(f"   响应类型: {type(products_data)}")
        print(f"   响应键: {list(products_data.keys())}")
        for key, value in products_data.items():
            print(f"   {key} - 类型: {type(value)}")
            if isinstance(value, (list, dict)):
                print(f"   {key} - 内容: {json.dumps(value, indent=2, ensure_ascii=False)[:200]}...")
    except Exception as e:
        print(f"   错误: {str(e)}")
    
    # 检查商品API的实际数据格式
    print("\n3. 检查商品API的数据结构:")
    try:
        products_response = requests.get('http://localhost:8000/api/products')
        products_data = products_response.json()
        
        # 检查是否有results字段
        if 'results' in products_data:
            print(f"   有results字段，类型: {type(products_data['results'])}")
            print(f"   商品数量: {len(products_data['results'])}")
            if products_data['results']:
                print(f"   第一个商品: {json.dumps(products_data['results'][0], indent=2, ensure_ascii=False)[:300]}...")
        
        # 检查是否有data字段
        elif 'data' in products_data:
            print(f"   有data字段，类型: {type(products_data['data'])}")
            print(f"   商品数量: {len(products_data['data'])}")
            if products_data['data']:
                print(f"   第一个商品: {json.dumps(products_data['data'][0], indent=2, ensure_ascii=False)[:300]}...")
        else:
            print(f"   没有找到results或data字段")
            print(f"   完整响应: {json.dumps(products_data, indent=2, ensure_ascii=False)[:300]}...")
            
    except Exception as e:
        print(f"   错误: {str(e)}")

if __name__ == "__main__":
    check_api_endpoints()