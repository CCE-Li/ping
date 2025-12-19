<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-6">订单确认</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 收货信息 -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h2 class="text-lg font-medium mb-4">收货信息</h2>
          <form @submit.prevent="submitOrder">
            <div class="mb-4">
              <label class="block text-gray-700 mb-2">收货人</label>
              <input 
                v-model="orderInfo.recipient" 
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="请输入收货人姓名"
                required
              >
            </div>
            
            <div class="mb-4">
              <label class="block text-gray-700 mb-2">手机号</label>
              <input 
                v-model="orderInfo.phone" 
                type="tel" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="请输入手机号"
                required
              >
            </div>
            
            <div class="mb-4">
              <label class="block text-gray-700 mb-2">详细地址</label>
              <textarea 
                v-model="orderInfo.address" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows="3"
                placeholder="请输入详细地址"
                required
              ></textarea>
            </div>
          </form>
        </div>
        
        <!-- 商品清单 -->
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h2 class="text-lg font-medium mb-4">商品清单</h2>
          <div class="space-y-4">
            <div 
              v-for="item in cartStore.items" 
              :key="item.id" 
              class="flex items-center pb-4 border-b"
            >
              <img :src="item.image" alt="商品图片" class="w-16 h-16 object-cover mr-4">
              <div class="flex-1">
                <h3 class="font-medium line-clamp-2">{{ item.name }}</h3>
                <div class="flex justify-between items-center mt-2">
                  <span class="text-gray-500">x{{ item.quantity }}</span>
                  <span class="font-medium">{{ formatPrice(item.price * item.quantity) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 订单汇总 -->
      <div class="lg:col-span-1">
        <div class="bg-white p-6 rounded-lg shadow-sm sticky top-4">
          <h2 class="text-lg font-medium mb-4">订单汇总</h2>
          <div class="space-y-2 mb-6">
            <div class="flex justify-between">
              <span>商品总价：</span>
              <span>{{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
            <div class="flex justify-between">
              <span>运费：</span>
              <span>¥0.00</span>
            </div>
            <div class="flex justify-between text-xl font-bold mt-4 pt-4 border-t">
              <span>实付款：</span>
              <span class="text-secondary">{{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
          </div>
          
          <button 
            class="btn-primary w-full" 
            @click="submitOrder"
            :disabled="!orderInfo.recipient || !orderInfo.phone || !orderInfo.address || loading"
          >
            {{ loading ? '提交中...' : '提交订单' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { useUserStore } from '../stores/userStore'
import { ElMessage } from 'element-plus'
import { orderApi } from '../utils/api'
import { formatPrice } from '../utils/productDataUtils'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(false)
const orderInfo = ref({
  recipient: '',
  phone: '',
  address: ''
})

// 如果购物车为空，重定向到购物车页面
if (cartStore.isEmpty) {
  router.replace('/cart')
}

const submitOrder = async () => {
  if (!orderInfo.value.recipient || !orderInfo.value.phone || !orderInfo.value.address) {
    alert('请填写完整的收货信息')
    return
  }
  
  loading.value = true
  try {
    const items = cartStore.items.map(it => ({
      product_id: it.id,
      quantity: it.quantity
    }))

    const res = await orderApi.createOrder({
      recipient: orderInfo.value.recipient,
      phone: orderInfo.value.phone,
      address: orderInfo.value.address,
      items
    })

    if (!res?.success) {
      throw new Error(res?.error || '订单提交失败')
    }

    ElMessage.success('订单提交成功')
    cartStore.clearCart()
    router.push('/orders')
  } catch (error) {
    console.error('提交订单失败', error)
    const backendMsg = error?.response?.data?.error
    ElMessage.error(backendMsg || error?.message || '提交订单失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>