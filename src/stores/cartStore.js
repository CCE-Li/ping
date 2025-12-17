// 导入Pinia的defineStore函数，用于创建状态管理模块
import { defineStore } from 'pinia'

// 创建购物车状态管理模块
export const useCartStore = defineStore('cart', {
  // 状态定义 - 使用函数返回初始状态对象，确保组件间状态独立
  state: () => ({
    // 从localStorage中加载购物车数据，如果没有则初始化为空数组
    items: JSON.parse(localStorage.getItem('cartItems')) || []
  }),
  
  // Getters - 计算属性，用于获取购物车相关数据
  getters: {
    // 计算购物车中商品的总数量
    cartCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    
    // 计算购物车中商品的总价格
    totalPrice: (state) => state.items.reduce((total, item) => total + parseFloat(item.price || 0) * item.quantity, 0),
    
    // 判断购物车是否为空
    isEmpty: (state) => state.items.length === 0
  },
  
  // Actions - 定义修改状态的方法
  actions: {
    // 添加商品到购物车
    addToCart(product, quantity = 1) {
      // 查找是否已存在相同商品
      const existingItem = this.items.find(item => item.id === product.id)
      if (existingItem) {
        // 如果商品已存在，则增加数量
        existingItem.quantity += quantity
      } else {
        // 如果商品不存在，则添加新商品
        this.items.push({
          ...product, // 复制商品信息
          quantity // 设置数量
        })
      }
      // 保存到本地存储
      this.saveToLocalStorage()
    },
    
    // 更新商品数量
    updateQuantity(productId, quantity) {
      // 查找要更新的商品
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          // 如果数量为0或负数，则从购物车移除
          this.removeFromCart(productId)
        } else {
          // 更新商品数量
          item.quantity = quantity
          // 保存到本地存储
          this.saveToLocalStorage()
        }
      }
    },
    
    // 从购物车移除商品
    removeFromCart(productId) {
      // 过滤掉指定ID的商品
      this.items = this.items.filter(item => item.id !== productId)
      // 保存到本地存储
      this.saveToLocalStorage()
    },
    
    // 清空购物车
    clearCart() {
      // 将购物车数组置为空
      this.items = []
      // 保存到本地存储
      this.saveToLocalStorage()
    },
    
    // 将购物车数据保存到本地存储，确保页面刷新后数据不丢失
    saveToLocalStorage() {
      localStorage.setItem('cartItems', JSON.stringify(this.items))
    }
  }
})