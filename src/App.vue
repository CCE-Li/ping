<script setup>
// 导入顶部导航栏组件
import Navbar from './components/Navbar.vue'
// 导入底部导航栏组件
import BottomNavbar from './components/BottomNavbar.vue'

// 导入Vue Router的路由管理函数
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const showNavPages = computed(() => ['/', '/category', '/message', '/cart', '/profile', '/service', '/orders'].includes(route.path))
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏组件 - 只在首页、分类、消息、购物车和个人中心页面显示（桌面端） -->
    <div class="hidden md:block" v-if="showNavPages">
      <Navbar />
    </div>

    <!-- 主内容区域 -->
    <main class="pb-[72px] md:pb-0 md:pt-0">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部导航栏组件 - 只在首页、分类、消息、购物车和个人中心页面显示（移动端） -->
    <div class="md:hidden" v-if="showNavPages">
      <BottomNavbar />
    </div>
    
    <!-- 页脚组件 -->
    <footer v-if="!showNavPages" class="bg-gray-100 py-6 mt-8">
      <div class="container mx-auto px-4 text-center text-gray-600">
        <p>&copy; {{ new Date().getFullYear() }} 购物平台. 保留所有权利.</p>
      </div>
    </footer>
  </div>
</template>

<style>
/* 页面切换过渡动画样式定义 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
