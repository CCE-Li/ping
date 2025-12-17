// 导入Vue Router的创建函数
import { createRouter, createWebHistory } from 'vue-router'

// 定义路由配置数组
const routes = [
  // 首页路由
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  // 分类页路由
  {
    path: '/category',
    name: 'Category',
    component: () => import('../views/Category.vue')
  },
  // 消息页路由
  {
    path: '/message',
    name: 'Message',
    component: () => import('../views/Message.vue')
  },
  // 购物车路由
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue')
  },
  // 个人中心路由
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue')
  },
  // 商品详情路由 - 包含动态参数id
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetail.vue')
  },
  // 登录页路由
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  // 注册页路由
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  // 结算页路由 - 设置requiresAuth元信息表示需要登录
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue'),
    meta: { requiresAuth: true }
  },
  // 处理/hybridaction/...路径的通配符路由
  {
    path: '/hybridaction/:pathMatch(.*)*',
    name: 'HybridAction',
    component: () => import('../views/Home.vue') // 使用Home组件作为兜底
  },
  // 动态标签管理示例路由
  {
    path: '/dynamic-frame-example',
    name: 'DynamicFrameExample',
    component: () => import('../components/DynamicFrameExample.vue')
  },
]

// 创建路由实例
const router = createRouter({
  // 使用HTML5 History模式，不使用hash (#) 路由
  history: createWebHistory(),
  // 应用路由配置
  routes
})

// 全局前置守卫 - 在每次路由切换前执行
router.beforeEach((to, from, next) => {
  // 检查用户是否已登录（通过localStorage中的token判断）
  const isAuthenticated = localStorage.getItem('token')
  
  // 如果目标路由需要认证且用户未登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 重定向到登录页
    next({ name: 'Login' })
  } else {
    // 允许路由继续
    next()
  }
})

// 导出路由实例，供main.js使用
export default router