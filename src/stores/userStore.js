// 导入Pinia的defineStore函数，用于创建状态管理模块
import { defineStore } from 'pinia'

// 创建用户状态管理模块
export const useUserStore = defineStore('user', {
  // 状态定义 - 使用函数返回初始状态对象
  state: () => ({
    // 从localStorage中加载用户信息，如果没有则初始化为null
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
    // 从localStorage中加载认证令牌，如果没有则初始化为空字符串
    token: localStorage.getItem('token') || ''
  }),
  
  // Getters - 计算属性，用于获取用户相关状态
  getters: {
    // 判断用户是否已登录（通过检查token是否存在）
    isLoggedIn: (state) => !!state.token,
    // 获取用户名，如果用户未登录则返回空字符串
    username: (state) => state.userInfo?.username || ''
  },
  
  // Actions - 定义修改状态的方法
  actions: {
    // 用户登录
    login(userData, token) {
      // 更新用户信息状态
      this.userInfo = userData
      // 更新token状态
      this.token = token
      // 将用户信息保存到localStorage，确保页面刷新后保持登录状态
      localStorage.setItem('userInfo', JSON.stringify(userData))
      // 将token保存到localStorage
      localStorage.setItem('token', token)
    },
    
    // 用户登出
    logout() {
      // 清除用户信息状态
      this.userInfo = null
      // 清除token状态
      this.token = ''
      // 从localStorage中移除用户信息
      localStorage.removeItem('userInfo')
      // 从localStorage中移除token
      localStorage.removeItem('token')
    },
    
    // 更新用户信息
    updateUserInfo(info) {
      // 使用展开运算符合并现有用户信息和新信息
      this.userInfo = { ...this.userInfo, ...info }
      // 将更新后的用户信息保存到localStorage
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    }
  }
})