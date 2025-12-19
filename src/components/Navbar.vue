<template>
  <nav class="bg-white shadow-md">
    <div class="wrapper">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 font-bold text-xl text-primary">购物平台</div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <router-link 
                to="/" 
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                active-class="bg-primary/10 text-primary"
              >
                首页
              </router-link>
              <router-link 
                to="/category" 
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                active-class="bg-primary/10 text-primary"
              >
                商品分类
              </router-link>
              <router-link 
                to="/message" 
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                active-class="bg-primary/10 text-primary"
              >
                消息
              </router-link>
              <router-link 
                to="/cart" 
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100 relative"
                active-class="bg-primary/10 text-primary"
              >
                购物车
                <!-- 购物车数量指示器 -->
                <span v-if="cartStore.cartCount > 0" class="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {{ cartStore.cartCount }}
                </span>
              </router-link>
              <router-link 
                to="/profile" 
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                active-class="bg-primary/10 text-primary"
              >
                个人中心
              </router-link>
            </div>
          </div>
        </div>
        <div class="hidden md:block">
          <div class="ml-4 flex items-center md:ml-6">
            <button 
              class="p-1 rounded-full text-gray-600 hover:text-primary focus:outline-none"
              @click="toggleDarkMode"
            >
              <span v-if="isDarkMode">🌞</span>
              <span v-else>🌙</span>
            </button>
            
            <div v-if="userStore.isLoggedIn" class="ml-3 relative">
              <div class="flex items-center">
                <span class="text-sm font-medium text-gray-700 mr-2">
                  {{ userStore.userInfo?.nickname || userStore.userInfo?.username }}
                </span>
                <button 
                  @click="logout"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-red-500 text-white hover:bg-red-600"
                >
                  退出登录
                </button>
              </div>
            </div>
            
            <div v-else class="flex items-center space-x-2">
              <router-link to="/login" class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 border border-primary text-primary hover:bg-primary/10">登录</router-link>
              <router-link to="/register" class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-primary text-white hover:bg-primary/90">注册</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useCartStore } from '../stores/cartStore'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const isDarkMode = ref(false)

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('darkMode', isDarkMode.value)
}

const logout = async () => {
  try {
    if (confirm('确定要退出登录吗？')) {
      await userStore.logout()
      router.push('/login')
    }
  } catch (error) {
    console.error('登出失败:', error)
  }
}

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode') === 'true'
  isDarkMode.value = savedDarkMode
  document.documentElement.classList.toggle('dark', savedDarkMode)
})
</script>