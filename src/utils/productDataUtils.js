// 商品数据处理工具函数

/**
 * 转换商品数据，确保字段结构一致
 * @param {Object} product - 原始商品数据
 * @returns {Object} 转换后的商品数据
 */
export const transformProductData = (product) => {
  if (!product) return null;
  const rawCategoryName = product.category ? String(product.category) : '';
  const categoryName = rawCategoryName ? rawCategoryName.charAt(0).toUpperCase() + rawCategoryName.slice(1) : '未分类';
  const categoryId = product.category_id ?? (rawCategoryName ? rawCategoryName.toLowerCase().replace(/\s+/g, '-') : 'unclassified');
  
  return {
    // 基础信息
    id: product.id || 0,
    name: product.name || '未命名商品',
    description: product.description || '暂无描述',
    
    // 价格信息
    price: parseFloat(product.price || 0),
    originalPrice: parseFloat(product.price || 0),
    
    // 分类信息 - 后端返回的是字符串，需要转换为对象格式
    category: {
      // 使用分类名称的哈希值作为ID，确保唯一性
      id: categoryId,
      name: categoryName,
      description: ''
    },
    
    // 库存信息
    stock: parseInt(product.stock || 0),
    
    // 图片信息
    image: product.image || '/images/default-product.png',
    
    // 扩展信息（如果需要）
    discount: product.discount || null,
    discountPrice: product.discountPrice || null,
    rating: parseFloat(product.rating || 5.0),
    
    // 其他信息
    createdAt: product.createdAt || null,
    updatedAt: product.updatedAt || null
  };
};

/**
 * 批量转换商品数据
 * @param {Array} products - 原始商品数据数组
 * @returns {Array} 转换后的商品数据数组
 */
export const transformProductsData = (products) => {
  if (!Array.isArray(products)) return [];
  
  return products.map(transformProductData).filter(Boolean);
};

/**
 * 格式化价格显示
 * @param {number} price - 价格
 * @returns {string} 格式化后的价格字符串
 */
export const formatPrice = (price) => {
  return `¥${parseFloat(price || 0).toFixed(2)}`;
};

/**
 * 检查商品是否有库存
 * @param {Object} product - 商品对象
 * @returns {boolean} 是否有库存
 */
export const hasStock = (product) => {
  return product && product.stock > 0;
};

/**
 * 获取商品分类名称
 * @param {Object} product - 商品对象
 * @returns {string} 分类名称
 */
export const getProductCategoryName = (product) => {
  if (!product || !product.category) return '未分类';
  return product.category.name || '未分类';
};
