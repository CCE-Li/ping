<script setup>
// 导入Vue的ref函数，用于创建响应式数据
import { ref } from 'vue'

// 定义组件属性（Props）
// msg: 字符串类型，用于接收父组件传递的消息内容
defineProps({
  msg: String,
})

// 创建响应式数据count，初始值为0
// 这个变量将用于展示计数器功能
const count = ref(0)
</script>

<template>
  <!-- 显示从父组件接收的msg属性内容 -->
  <h1>{{ msg }}</h1>

  <!-- 计数器卡片 -->
  <div class="card">
    <!-- 按钮：点击时count值加1，并显示当前count值 -->
    <button type="button" @click="count++">count is {{ count }}</button>
    <!-- 提示信息：说明这是一个用于测试热模块替换(HMR)的示例 -->
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <!-- Vue官方文档链接 -->
  <p>
    Check out
    <!-- 链接到Vue官方的快速入门指南 -->
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  
  <!-- IDE支持指南链接 -->
  <p>
    Learn more about IDE Support for Vue in the
    <!-- 链接到Vue文档中关于IDE支持的部分 -->
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  
  <!-- 文档提示文本 -->
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
/* 为文档提示文本定义样式 - 设置文字颜色为灰色 */
.read-the-docs {
  color: #888;
}
</style>
