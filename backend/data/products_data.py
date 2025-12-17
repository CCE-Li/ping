import json
from pathlib import Path


def load_products_data():
    base_dir = Path(__file__).resolve().parent.parent
    products_data_file = base_dir.parent / "products_data.json"

    with products_data_file.open("r", encoding="utf-8") as f:
        products_data = json.load(f)

    products = products_data.get("products", [])

    categories = []
    category_ids = set()

    for product in products:
        if "name" in product:
            name = str(product["name"]).lower()
            if any(keyword in name for keyword in ["backpack", "pack"]):
                category = "bags"
            elif any(keyword in name for keyword in ["shirt", "t-shirt", "top"]):
                category = "clothing"
            elif any(keyword in name for keyword in ["jacket", "coat"]):
                category = "outerwear"
            elif any(keyword in name for keyword in ["jewelry", "bracelet", "ring", "earrings"]):
                category = "jewelry"
            elif any(keyword in name for keyword in ["hard drive", "ssd", "usb"]):
                category = "electronics"
            elif any(keyword in name for keyword in ["laptop", "computer", "pc"]):
                category = "computers"
            elif any(keyword in name for keyword in ["watch", "clock"]):
                category = "watches"
            else:
                category = "other"

            product["category"] = category
            if category not in category_ids:
                category_ids.add(category)
                categories.append(
                    {
                        "id": len(categories) + 1,
                        "name": category.capitalize(),
                        "image": product.get("image"),
                    }
                )

    return products, categories


products, categories = load_products_data()
