<template>
  <div class="app-container">
    <header>
      <nav>
        <router-link to="/login">登录</router-link>
        <router-link to="/shopping">购物商城</router-link>
        <router-link to="/cart">购物车</router-link>
      </nav>
    </header>
    
    <main>
      <!-- 使用 router-view -->
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
// 移除了 HelloWorld 的导入
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

header {
  line-height: 1.5;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

nav {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  margin: 0;
  padding: 0;
}

nav a {
  margin-right: 2rem;
  text-decoration: none;
  color: var(--color-primary);
  font-weight: 500;
  transition: color 0.3s ease;
}

nav a.router-link-active {
  color: #409eff;
  font-weight: bold;
}

nav a:hover {
  color: #66b1ff;
}

main {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  nav {
    flex-direction: column;
    align-items: center;
    height: auto;
  }
  
  nav a {
    margin: 0.5rem 0;
    margin-right: 0;
  }
  
  main {
    padding: 10px;
  }
}
</style>