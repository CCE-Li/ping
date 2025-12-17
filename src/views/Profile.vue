<template>
  <div class="min-h-screen bg-gray-50 pb-20 container mx-auto max-w-md">
    <!-- 页面标题 -->
    <div class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-xl font-bold text-gray-800">个人中心</h1>
      </div>
    </div>
    
    <!-- 用户信息卡片 -->
    <div class="container mx-auto px-4 py-4">
      <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="p-6 flex items-center">
          <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            <img v-if="userStore.isLoggedIn" :src="userAvatar" alt="用户头像" class="w-full h-full object-cover">
            <div v-else class="h-10 w-10 text-gray-400 flex items-center justify-center font-bold">
              {{ userStore.username?.charAt(0) || '?' }}
            </div>
          </div>
          <div class="ml-4 flex-1">
            <h2 class="text-lg font-bold text-gray-800">
              {{ userStore.isLoggedIn ? userStore.username : '请登录' }}
            </h2>
            <p v-if="!userStore.isLoggedIn" class="text-sm text-gray-500">登录后享受更多服务</p>
            <p v-else class="text-sm text-gray-500">普通会员 | ID: {{ userId }}</p>
          </div>
          <button v-if="!userStore.isLoggedIn" class="bg-primary text-white px-4 py-2 rounded-full text-sm" @click="goToLogin">
            立即登录
          </button>
          <button v-else class="text-primary bg-primary/10 px-4 py-2 rounded-full text-sm">
            编辑资料
          </button>
        </div>
      </div>
      
      <!-- 订单状态 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="p-4 border-b">
          <h3 class="font-medium text-gray-800">我的订单</h3>
        </div>
        <div class="grid grid-cols-4 py-4">
          <div class="flex flex-col items-center p-2" @click="goToOrders('pending')">
            <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-1">
              <span class="text-sm font-bold text-gray-700">1</span>
            </div>
            <span class="text-xs text-gray-700">待付款</span>
            <span v-if="pendingOrders > 0" class="mt-1 w-4 h-4 bg-secondary text-white rounded-full text-xs flex items-center justify-center">
              {{ pendingOrders }}
            </span>
          </div>
          <div class="flex flex-col items-center p-2" @click="goToOrders('shipping')">
            <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-1">
              <span class="text-sm font-bold text-gray-700">2</span>
            </div>
            <span class="text-xs text-gray-700">待发货</span>
          </div>
          <div class="flex flex-col items-center p-2" @click="goToOrders('delivered')">
            <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-1">
              <span class="text-sm font-bold text-gray-700">3</span>
            </div>
            <span class="text-xs text-gray-700">待收货</span>
          </div>
          <div class="flex flex-col items-center p-2" @click="goToOrders('reviewed')">
            <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-1">
              <span class="text-sm font-bold text-gray-700">4</span>
            </div>
            <span class="text-xs text-gray-700">待评价</span>
          </div>
        </div>
      </div>
      
      <!-- 功能菜单 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="border-b">
          <div class="flex items-center p-3 border-b last:border-b-0" @click="goToAddress">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">📍</span>
            </div>
            <span class="ml-3 flex-1 text-gray-700">收货地址</span>
            <span class="text-sm font-bold text-gray-400">›</span>
          </div>
          <div class="flex items-center p-3 border-b last:border-b-0" @click="goToFavorites">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">❤️</span>
            </div>
            <span class="ml-3 flex-1 text-gray-700">我的收藏</span>
            <span class="text-sm font-bold text-gray-400">›</span>
          </div>
          <div class="flex items-center p-3 border-b last:border-b-0" @click="goToCoupons">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">🎫</span>
            </div>
            <span class="ml-3 flex-1 text-gray-700">优惠券</span>
            <div class="flex items-center">
              <span class="text-xs text-secondary mr-2">{{ availableCoupons }}张可用</span>
              <span class="text-sm font-bold text-gray-400">›</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 其他设置 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="border-b">
          <div class="flex items-center p-3 border-b last:border-b-0" @click="openPage1">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">📄</span>
            </div>
            <span class="ml-3 flex-1 text-gray-700">商家</span>
            <span class="text-sm font-bold text-gray-400">›</span>
          </div>
          <div class="flex items-center p-3 border-b last:border-b-0" @click="goToSettings">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">⚙️</span>
            </div>
            <span class="ml-3 flex-1 text-gray-700">设置</span>
            <span class="text-sm font-bold text-gray-400">›</span>
          </div>
          <div class="flex items-center p-3 border-b last:border-b-0" @click="goToHelp">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">❓</span>
            </div>
            <span class="ml-3 flex-1 text-gray-700">帮助与反馈</span>
            <span class="text-sm font-bold text-gray-400">›</span>
          </div>
          <div v-if="userStore.isLoggedIn" class="flex items-center p-3" @click="logout">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">🚪</span>
            </div>
            <span class="ml-3 text-red-500">退出登录</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// 模拟数据
const userId = '10001'
const userAvatar = 'https://picsum.photos/id/1005/100/100'
const pendingOrders = 2
const availableCoupons = 3

// 跳转方法
const goToLogin = () => {
  router.push('/login')
}

const goToOrders = (status) => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  // 实际应该跳转到订单列表页面
  alert(`跳转到${status}订单列表`)
}

const goToAddress = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  alert('跳转到收货地址页面')
}

const goToFavorites = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  alert('跳转到我的收藏页面')
}

const goToCoupons = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  alert('跳转到优惠券页面')
}

const goToSettings = () => {
  alert('跳转到设置页面')
}

const goToHelp = () => {
  alert('跳转到帮助与反馈页面')
}

// 打开商家
const openPage1 = () => {
  try {
    const newWindow = window.open('http://localhost:5005/page1', '_blank');
    if (newWindow) {
      // 窗口成功打开
      newWindow.focus();
    } else {
      // 窗口可能被浏览器阻止了
        alert('打开商家失败，可能是因为浏览器阻止了弹出窗口。请检查浏览器的弹出窗口设置。');
    }
  } catch (error) {
    console.error('打开商家时出错:', error);
      alert('打开商家时出错，请稍后重试。');
  }
}

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}
</script>