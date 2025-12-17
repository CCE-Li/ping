<template>
  <div class="bottom-nav">
    <router-link to="/" class="nav-item" exact-active-class="active">
      <div class="nav-icon-wrapper">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span class="nav-text">首页</span>
      </div>
    </router-link>
    <router-link to="/category" class="nav-item" active-class="active">
      <div class="nav-icon-wrapper">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
        <span class="nav-text">分类</span>
      </div>
    </router-link>
    <router-link to="/message" class="nav-item" active-class="active">
      <div class="nav-icon-wrapper">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span class="nav-text">消息</span>
      </div>
    </router-link>
    <router-link to="/cart" class="nav-item" active-class="active">
      <div class="nav-icon-wrapper">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <span class="nav-text">购物车</span>
      </div>
    </router-link>
    <router-link to="/profile" class="nav-item" active-class="active">
      <div class="nav-icon-wrapper">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span class="nav-text">我的</span>
      </div>
    </router-link>
  </div>
</template>

<script setup>
// 底部导航栏组件 - 美化艺术字版本
</script>

<style scoped>
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 8px 0;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 50;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(20px);
}

.nav-item {
  flex: 1;
  text-align: center;
  text-decoration: none;
  padding: 8px 0;
  position: relative;
  transition: all 0.3s ease;
  transform-origin: center;
}

.nav-item:hover {
  transform: translateY(-3px);
}

.nav-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.nav-icon {
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
  color: #64748b;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-text {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  transition: all 0.3s ease;
}

/* 选中状态效果 */
.nav-item.active .nav-icon {
  color: #4A6CF7;
  stroke-width: 2.5;
  transform: scale(1.1);
  filter: drop-shadow(0 2px 8px rgba(74, 108, 247, 0.4));
}

.nav-item.active .nav-text {
  color: #4A6CF7;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(74, 108, 247, 0.2);
  animation: textPop 0.3s ease-out;
}

/* 选中状态的背景效果 */
.nav-item.active {
  background: linear-gradient(135deg, rgba(74, 108, 247, 0.05), rgba(124, 77, 255, 0.05));
  border-radius: 12px;
  margin: 0 4px;
}

/* 文字弹出动画 */
@keyframes textPop {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 图标旋转动画 */
@keyframes iconRotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(5deg) scale(1.05);
  }
  100% {
    transform: rotate(0deg) scale(1.1);
  }
}

/* 响应式调整 */
@media (max-width: 375px) {
  .nav-icon {
    width: 22px;
    height: 22px;
  }
  
  .nav-text {
    font-size: 11px;
  }
}
</style>