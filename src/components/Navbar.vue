<template>
  <!--
    顶部导航栏
    - bg-white: 设置背景色为白色
    - shadow-sm: 添加轻微阴影，提升层次感
    - sticky top-0: 粘性定位，滚动时固定在顶部
    - z-50: 设置层级为50，确保显示在其他内容之上
    - transition-all duration-300: 添加过渡动画效果
  -->
  <header class="bg-white shadow-sm sticky top-0 z-50 transition-all duration-300">
    <div class="container px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo区域 - 添加了悬停动画效果 -->
        <router-link 
          to="/" 
          class="text-primary text-2xl font-bold tracking-tight transform transition-transform duration-300 hover:scale-105"
        >
          购物平台
        </router-link>
        
        <!-- 桌面端导航链接 - 使用hidden md:flex控制只在中等屏幕以上显示 -->
        <nav class="hidden md:flex space-x-8">
          <router-link 
            to="/" 
            class="text-gray-700 hover:text-primary font-medium transition-all duration-300 relative group" 
            exact
          >
            首页
            <!-- 悬停下划线动画效果 -->
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </router-link>
          <router-link 
            to="/cart" 
            class="text-gray-700 hover:text-primary font-medium transition-all duration-300 relative group" 
          >
            购物车
            <!-- 购物车数量指示器 - 绝对定位，只在购物车有商品时显示 -->
            <span v-if="cartStore.cartCount > 0" class="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
              {{ cartStore.cartCount }}
            </span>
            <!-- 悬停下划线动画效果 -->
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </router-link>
        </nav>
        
        <!-- 用户操作区域 - 包含登录/注册或用户信息和退出按钮 -->
        <div class="flex items-center space-x-4">
          <!-- 已登录状态显示 -->
          <div v-if="userStore.isLoggedIn" class="flex items-center space-x-4">
            <!-- 用户名显示 - 只在中等屏幕以上显示 -->
            <span class="text-gray-700 hidden md:inline font-medium">欢迎，{{ userStore.username }}</span>
            <!-- 退出按钮 -->
            <button 
              class="text-gray-700 hover:text-primary transition-colors px-2 py-1 rounded transition-all duration-300 hover:bg-gray-50"
              @click="logout"
            >
              退出
            </button>
          </div>
          <!-- 未登录状态显示 -->
          <div v-else class="flex space-x-4">
            <!-- 登录链接 -->
            <router-link 
              to="/login" 
              class="text-gray-700 hover:text-primary transition-all duration-300 px-3 py-1.5 rounded-md hover:bg-gray-50"
            >
              登录
            </router-link>
            <!-- 注册链接 - 主要操作，使用不同样式突出显示 -->
            <router-link 
              to="/register" 
              class="bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 px-3 py-1.5 rounded-md font-medium"
            >
              注册
            </router-link>
          </div>
          
          <!-- 移动端购物车图标 - 使用md:hidden控制只在移动端显示 -->
          <router-link to="/cart" class="md:hidden text-gray-700 hover:text-primary relative transition-colors">
            <!-- 购物车SVG图标 -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <!-- 移动端购物车数量指示器 -->
            <span v-if="cartStore.cartCount > 0" class="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
              {{ cartStore.cartCount }}
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
// 导入用户状态管理store
import { useUserStore } from '../stores/userStore'
// 导入购物车状态管理store
import { useCartStore } from '../stores/cartStore'
// 导入Vue Router的路由管理函数
import { useRouter } from 'vue-router'

// 初始化用户状态store
const userStore = useUserStore()
// 初始化购物车状态store
const cartStore = useCartStore()
// 初始化路由实例
const router = useRouter()

// 用户退出登录函数
const logout = () => {
  // 弹出确认对话框
  if (confirm('确定要退出登录吗？')) {
    // 调用userStore的logout方法清除用户信息
    userStore.logout()
    // 退出后跳转到登录页面
    router.push('/login')
  }
}
</script>