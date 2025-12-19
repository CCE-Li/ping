<script setup>
// 导入顶部导航栏组件
import Navbar from './components/Navbar.vue'
// 导入底部导航栏组件
import BottomNavbar from './components/BottomNavbar.vue'
// 导入Header和Footer组件
import Header from './components/Header.vue'
import ShopFooter from './components/ShopFooter.vue'

// 导入Vue Router的路由管理函数
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 导入公共样式
import './assets/base.css'
import './assets/common.css'

const route = useRoute()

const showNavPages = computed(() => ['/', '/category', '/message', '/cart', '/profile', '/service'].includes(route.path))
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 头部组件 -->
    <Header />
    
    <!-- 主内容区域 -->
    <main class="flex-grow pb-[72px] md:pb-0">
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
    <ShopFooter v-if="!showNavPages" />
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