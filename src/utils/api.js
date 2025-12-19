// API请求工具函数
import axios from 'axios'
import { transformProductData, transformProductsData } from './productDataUtils.js'

// 创建axios实例，设置基础URL指向后端
const apiClient = axios.create({
  baseURL: '/api', // API基础URL，使用相对路径通过Vite代理连接后端
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加第一个请求拦截器：移除URL尾斜杠（在URL拼接前检查相对路径）
apiClient.interceptors.request.use(
  config => {
    // 检查URL是否以斜杠结尾，如果是则移除
    if (config.url && config.url.endsWith('/')) {
      config.url = config.url.slice(0, -1);
      console.log('修正URL，移除尾斜杠:', config.url);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
)

// 添加第二个请求拦截器：记录请求日志（仅开发环境）
if (import.meta.env.DEV) {
  apiClient.interceptors.request.use(
    config => {
      // 在发送请求之前可以做些什么
      console.log(`发送请求: ${config.method.toUpperCase()} ${config.url}`)
      console.log('请求参数:', config.params || config.data)
      return config
    },
    error => {
      // 处理请求错误
      console.error('请求错误:', error)
      return Promise.reject(error)
    }
  )
}

// 添加第三个请求拦截器：确保完整URL（baseURL + url）不带尾斜杠
apiClient.interceptors.request.use(
  config => {
    if (import.meta.env.DEV) {
      console.log('API Client Request Interceptor - Original URL:', config.url);
    }
    // 检查完整URL是否以斜杠结尾
    const fullUrl = config.baseURL + config.url;
    if (import.meta.env.DEV) {
      console.log('API Client Request Interceptor - Full URL:', fullUrl);
    }
    if (fullUrl.endsWith('/')) {
      // 从config.url中移除尾斜杠
      config.url = config.url.slice(0, -1);
      if (import.meta.env.DEV) {
        console.log('API Client Request Interceptor - Fixed URL:', config.baseURL + config.url);
      }
    }
    return config;
  },
  error => {
    if (import.meta.env.DEV) {
      console.error('API Client Request Interceptor Error:', error);
    }
    return Promise.reject(error);
  }
)

// 添加第四个请求拦截器：自动携带 token（与后端 /api/login 返回的 token 配合）
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || ''
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 添加响应拦截器
apiClient.interceptors.response.use(
  response => {
    // 对响应数据做点什么（仅开发环境记录日志）
    if (import.meta.env.DEV) {
      console.log(`响应成功: ${response.config.url}`)
    }
    return response
  },
  error => {
    // 对响应错误做点什么（仅开发环境记录详细日志）
    if (import.meta.env.DEV) {
      console.error('响应错误:', error)
      console.error('错误详情:', error.response)
      
      // 根据错误状态码提供更详细的错误信息
      if (error.response) {
        // 服务器返回了错误状态码
        switch (error.response.status) {
          case 400:
            console.error('错误请求: 参数可能有误')
            break
          case 401:
            console.error('未授权: 请检查登录状态')
            break
          case 403:
            console.error('禁止访问: 您没有权限执行此操作')
            break
          case 404:
            console.error('未找到资源: 请求的API路径可能不存在')
            break
          case 500:
            console.error('服务器错误: 请联系管理员')
            break
          default:
            console.error(`错误状态码: ${error.response.status}`)
        }
      } else if (error.request) {
        // 请求已发出，但没有收到响应
        console.error('网络错误: 服务器没有响应')
      } else {
        // 请求配置时发生错误
        console.error('请求配置错误:', error.message)
      }
    }
    
    return Promise.reject(error)
  }
)

// 分类API
export const categoryApi = {
  // 获取所有分类
  getAll: async () => {
    try {
      const response = await apiClient.get('/categories')
      const payload = response.data || {}
      return {
        results: payload.data || payload.results || []
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      // 接口失败时返回空数组，避免后续数据异常
      return {
        results: []
      }
    }
  },
  
  // 根据ID获取分类
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/categories/${id}`)
      return response.data || {}
    } catch (error) {
      console.error(`获取分类ID: ${id} 失败:`, error)
      // 接口失败时返回空对象，避免后续数据异常
      return {}
    }
  }
}

// 商品API
export const productApi = {
  // 获取所有商品，支持分页
  getAll: async (page = 1, categoryId = null, keyword = null, perPage = null) => {
    try {
      // 添加类型检查，确保page是数字
      const pageNum = typeof page === 'number' ? page : parseInt(page) || 1;
      
      const params = {};
      params.page = pageNum; // 始终添加page参数
      if (perPage !== null && perPage !== '' && perPage !== undefined) {
        params.per_page = perPage;
      }
      if (categoryId !== null && categoryId !== '' && categoryId !== undefined) {
        params.category_id = categoryId;
      }
      if (keyword !== null && keyword !== '' && keyword !== undefined) {
        params.keyword = keyword;
      }
      
      if (import.meta.env.DEV) {
        console.log('准备请求商品列表，参数:', params);
      }
      
      const response = await apiClient.get(`/products`, { params });
      
      if (import.meta.env.DEV) {
        console.log('商品列表请求成功，响应:', response.data);
      }
      
      const payload = response.data || {}

      // API返回的是分页数据，商品列表在payload.results中
      const productsData = payload.results || [];
      
      // 转换商品数据，确保字段结构正确
      const transformedProducts = transformProductsData(productsData);
      
      if (import.meta.env.DEV) {
        console.log('商品数据转换成功，转换后:', transformedProducts);
      }
      
      return {
        results: transformedProducts,
        count: payload.count || transformedProducts.length || 0
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('获取商品列表失败:', error);
        console.error('错误详情:', error.response || error.message || error);
      }
      // 接口失败时返回空数据，避免后续数据异常
      return {
        results: [],
        count: 0
      }
    }
  },
  
  // 根据ID获取商品
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`)
      const payload = response.data || {}
      const product = payload.data || payload || {}
      
      // 转换商品数据，确保字段结构正确
      return transformProductData(product) || {
        id: id,
        name: '商品不存在',
        image: '',
        price: 0,
        category: { id: null, name: '' },
        discount: null,
        discountPrice: null,
        originalPrice: 0,
        rating: 0
      }
    } catch (error) {
      console.error(`获取商品ID: ${id} 失败:`, error)
      // 接口失败时返回空对象，避免后续数据异常
      return {
        id: id,
        name: '商品不存在',
        image: '',
        price: 0,
        category: { id: null, name: '' },
        discount: null,
        discountPrice: null,
        originalPrice: 0,
        rating: 0
      }
    }
  },
  
  // 根据分类ID获取商品
  getByCategoryId: async (categoryId, page = 1) => {
    try {
      const params = {};
      params.page = page; // 始终添加page参数
      params.category_id = categoryId;
      
      const response = await apiClient.get(`/products`, { params })

      const payload = response.data || {}
      
      // 转换商品数据，确保字段结构正确
      const productsData = payload.results || [];
      const transformedProducts = transformProductsData(productsData);
      
      return {
        results: transformedProducts,
        count: payload.count || transformedProducts.length || 0
      }
    } catch (error) {
      console.error(`获取分类ID: ${categoryId} 商品失败:`, error)
      throw error
    }
  }
}

// 消息中心 API
export const messageApi = {
  getUserMessages: async (userId) => {
    const safeUserId = userId || 'guest'
    const response = await apiClient.get(`/messages/${encodeURIComponent(safeUserId)}`)
    return response.data || {}
  }
}

// AI 智能客服 API
export const aiApi = {
  chat: async ({ user_id, msg }) => {
    const response = await apiClient.post('/ai_chat', { user_id, msg })
    return response.data || {}
  },
  transfer: async ({ user_id }) => {
    const response = await apiClient.post('/transfer_service', { user_id })
    return response.data || {}
  }
}

// 用户API
export const userApi = {
  // 登录
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/login', credentials)
      return response.data
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  },
  
  // 注册
  register: async (userData) => {
    try {
      const response = await apiClient.post('/register', userData)
      return response.data
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  },
  
  // 获取用户信息
  getUserInfo: async () => {
    try {
      const response = await apiClient.get('/user')
      return response.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  },

  // 获取用户资料
  getProfile: async () => {
    const response = await apiClient.get('/user')
    return response.data || {}
  },

  // 更新用户资料
  updateProfile: async (profile) => {
    const response = await apiClient.put('/user', profile)
    return response.data || {}
  }
}

// 购物车API
export const cartApi = {
  // 获取购物车
  getCart: async () => {
    try {
      const response = await apiClient.get('/cart')
      return response.data
    } catch (error) {
      console.error('获取购物车失败:', error)
      throw error
    }
  },
  
  // 添加商品到购物车
  addToCart: async (cartItem) => {
    try {
      const response = await apiClient.post('/cart/items', cartItem)
      return response.data
    } catch (error) {
      console.error('添加商品到购物车失败:', error)
      throw error
    }
  },
  
  // 更新购物车商品数量
  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await apiClient.put(`/cart/items/${itemId}`, { quantity })
      return response.data
    } catch (error) {
      console.error('更新购物车商品数量失败:', error)
      throw error
    }
  },
  
  // 删除购物车商品
  removeCartItem: async (itemId) => {
    try {
      const response = await apiClient.delete(`/cart/items/${itemId}`)
      return response.data
    } catch (error) {
      console.error('删除购物车商品失败:', error)
      throw error
    }
  }
}

// 订单API
export const orderApi = {
  // 创建订单
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/orders', orderData)
      return response.data
    } catch (error) {
      console.error('创建订单失败:', error)
      throw error
    }
  },
  
  // 获取订单列表
  getOrders: async (status = '') => {
    try {
      const params = {}
      if (status) params.status = status
      const response = await apiClient.get('/orders', { params })
      return response.data
    } catch (error) {
      console.error('获取订单列表失败:', error)
      throw error
    }
  },
  
  // 获取订单详情
  getOrderDetail: async (orderId) => {
    try {
      const response = await apiClient.get(`/orders/${orderId}`)
      return response.data
    } catch (error) {
      console.error(`获取订单ID: ${orderId} 详情失败:`, error)
      throw error
    }
  },

  // 支付订单（模拟）
  payOrder: async (orderId) => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/pay`)
      return response.data
    } catch (error) {
      console.error(`支付订单ID: ${orderId} 失败:`, error)
      throw error
    }
  }
}

export const adminApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/admin/login', credentials)
    return response.data || {}
  },

  initAdmin: async ({ initKey, username, password }) => {
    const response = await apiClient.post(
      '/admin/init',
      { username, password },
      {
        headers: {
          'X-Admin-Init-Key': initKey
        }
      }
    )
    return response.data || {}
  },

  resetProductsStock: async (stock = 100) => {
    const token = localStorage.getItem('adminToken') || ''
    const response = await apiClient.post(
      '/admin/products/stock/reset',
      { stock },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    )
    return response.data || {}
  },

  listProducts: async (params = {}) => {
    const token = localStorage.getItem('adminToken') || ''
    const response = await apiClient.get('/admin/products', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data || {}
  },

  createProduct: async (payload) => {
    const token = localStorage.getItem('adminToken') || ''
    const response = await apiClient.post('/admin/products', payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data || {}
  },

  updateProduct: async (productId, payload) => {
    const token = localStorage.getItem('adminToken') || ''
    const response = await apiClient.put(`/admin/products/${productId}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data || {}
  },

  deleteProduct: async (productId) => {
    const token = localStorage.getItem('adminToken') || ''
    const response = await apiClient.delete(`/admin/products/${productId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data || {}
  },

  listOrders: async (params = {}) => {
    const token = localStorage.getItem('adminToken') || ''
    const response = await apiClient.get('/admin/orders', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data || {}
  },

  updateOrder: async (orderId, payload) => {
    const token = localStorage.getItem('adminToken') || ''
    const response = await apiClient.put(`/admin/orders/${orderId}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data || {}
  },

  deleteOrder: async (orderId) => {
    const token = localStorage.getItem('adminToken') || ''
    const response = await apiClient.delete(`/admin/orders/${orderId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return response.data || {}
  }
}
