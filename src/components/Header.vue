<template>
  <div class="header-container">
    <!-- 快捷导航 -->
    <div class="shortcut bg-gray-800 h-12">
      <div class="wrapper h-full">
        <ul class="flex justify-end items-center h-full">
          <li><a href="#" class="text-gray-300 hover:text-white px-4 text-sm">联系我们</a></li>
          <li><a href="#" class="text-gray-300 hover:text-white px-4 text-sm">客户服务</a></li>
          <li><a href="#" class="text-gray-300 hover:text-white px-4 text-sm">网站导航</a></li>
        </ul>
      </div>
    </div>
    
    <!-- 头部 -->
    <div class="header py-4">
      <div class="wrapper flex items-center">
        <!-- logo -->
        <div class="logo mr-20">
          <a href="/" class="text-2xl font-bold text-primary">购物平台</a>
        </div>
        
        <!-- 搜索区域 -->
        <div class="search flex items-center border-b border-gray-300 flex-1 max-w-2xl">
          <input type="text" placeholder="请输入商品名称" class="w-full py-2 px-2 focus:outline-none">
          <span class="text-gray-400 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
        
        <!-- 购物车 -->
        <div class="cart ml-10">
          <a href="/cart" class="flex items-center text-gray-700 hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <span class="ml-1">购物车</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 这里可以添加头部组件的逻辑
</script>

<style scoped>
.header-container {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>