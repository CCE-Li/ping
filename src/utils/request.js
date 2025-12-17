// 导入axios库，用于发送HTTP请求
import axios from 'axios'
// 导入用户状态管理，用于获取认证token
import { useUserStore } from '../stores/userStore'

// 创建axios实例，配置基础URL和请求参数
const request = axios.create({
  // 从环境变量获取API基础URL，如果不存在则使用默认值
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api', // 后端API基础URL
  // 设置请求超时时间为10秒
  timeout: 10000, // 请求超时时间
  // 设置默认请求头
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加请求拦截器，确保URL不带尾斜杠
request.interceptors.request.use(
  config => {
    // 检查URL是否以斜杠结尾，如果是则移除
    if (config.url && config.url.endsWith('/')) {
      config.url = config.url.slice(0, -1);
      console.log('request.js修正URL，移除尾斜杠:', config.url);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
)

// 请求拦截器 - 在发送请求前执行
request.interceptors.request.use(
  // 请求成功处理函数
  config => {
    // 获取用户状态管理实例
    const userStore = useUserStore()
    // 如果用户已登录，在请求头中添加Authorization token
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    // 返回修改后的配置
    return config
  },
  // 请求错误处理函数
  error => {
    // 直接返回Promise错误
    return Promise.reject(error)
  }
)

// 响应拦截器 - 在接收到响应后执行
request.interceptors.response.use(
  // 响应成功处理函数
  response => {
    // 直接返回响应数据部分，简化使用
    return response.data
  },
  // 响应错误处理函数
  error => {
    // 统一错误处理逻辑
    if (error.response) {
      // 根据HTTP状态码进行不同处理
      switch (error.response.status) {
        case 401: // 未授权
          // 清除token并跳转到登录页
          const userStore = useUserStore()
          userStore.logout()
          window.location.href = '/login'
          break
        case 403: // 禁止访问
          console.error('没有权限访问该资源')
          break
        case 404: // 资源不存在
          console.error('请求的资源不存在')
          break
        case 500: // 服务器错误
          console.error('服务器内部错误')
          break
        default: // 其他错误
          console.error(error.response.data?.message || '请求失败')
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查网络连接')
    } else {
      // 请求配置出错
      console.error('请求配置错误')
    }
    // 返回Promise错误
    return Promise.reject(error)
  }
)

// 导出封装的常用请求方法
export default {
  // GET请求方法
  get(url, params = {}) {
    return request.get(url, { params })
  },
  // POST请求方法
  post(url, data = {}) {
    return request.post(url, data)
  },
  // PUT请求方法
  put(url, data = {}) {
    return request.put(url, data)
  },
  // DELETE请求方法
  delete(url, params = {}) {
    return request.delete(url, { params })
  }
}