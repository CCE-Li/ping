import { createRouter, createWebHistory } from 'vue-router'
import ShoppingView from '../views/ShoppingView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CartView from '../views/CartView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
 
  {
    path: '/shopping',
    name: 'Shopping',
    component: ShoppingView
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetailView,
    props: true
  },
  {
    path: '/cart',
    name: 'Cart',
    component: CartView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router