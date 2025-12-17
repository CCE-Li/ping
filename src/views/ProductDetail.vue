<template>
  <div class="container mx-auto py-8 px-4">
    <button class="text-gray-600 mb-4 hover:text-gray-900 transition-colors" @click="goBack">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      返回
    </button>
    
    <div v-if="product" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 商品图片 - 美化并调整大小 -->
      <div class="bg-white rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <div class="relative w-full max-w-md mx-auto aspect-[4/3] overflow-hidden">
          <img :src="product.image" alt="商品图片" class="w-full h-full object-contain p-8 transform transition-transform duration-500 hover:scale-105 mx-auto">
        </div>
      </div>
      
      <!-- 商品信息 - 美化布局 -->
      <div class="flex flex-col justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{{ product.name }}</h1>
          <div class="flex items-center mb-4">
            <span class="text-secondary text-2xl md:text-3xl font-bold mr-4">{{ formatPrice(product.price) }}</span>
            <span class="text-green-500 text-sm bg-green-50 py-1 px-2 rounded-full">
              库存充足
            </span>
          </div>
          <div class="mb-6 bg-gray-50 p-4 rounded-lg">
            <p class="text-gray-600">{{ product.description }}</p>
          </div>
          
          <div class="mb-6">
            <span class="text-gray-700">库存: {{ product.stock }} 件</span>
          </div>
        </div>
        
        <div>
          <div class="mb-8">
            <label class="block text-gray-700 mb-2">数量</label>
            <div class="flex items-center w-40">
              <button 
                class="w-10 h-10 border border-gray-300 rounded-l-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
              >
                -
              </button>
              <input 
                type="number" 
                v-model.number="quantity" 
                class="w-16 h-10 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-1 focus:ring-primary"
                :min="1"
                :max="product.stock"
              >
              <button 
                class="w-10 h-10 border border-gray-300 rounded-r-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                @click="increaseQuantity"
                :disabled="quantity >= product.stock"
              >
                +
              </button>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-4">
            <button class="btn-primary flex-1 py-3 text-lg font-medium" @click="addToCart">
              加入购物车
            </button>
            <button class="btn-secondary flex-1 py-3 text-lg font-medium" @click="buyNow">
              立即购买
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-12">
      <p class="text-gray-500">商品不存在</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { productApi } from '../utils/api'
import { formatPrice } from '../utils/productDataUtils'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref(null)
const quantity = ref(1)
const loading = ref(true)

onMounted(async () => {
  const productId = parseInt(route.params.id)
  try {
    // 从API获取商品数据
    product.value = await productApi.getById(productId)
    loading.value = false
  } catch (error) {
    console.error('获取商品详情失败:', error)
    loading.value = false
  }
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 增加数量
const increaseQuantity = () => {
  if (product.value && quantity.value < product.value.stock) {
    quantity.value++
  }
}

// 添加到购物车
const addToCart = () => {
  if (product.value) {
    cartStore.addToCart(product.value, quantity.value)
    alert('已添加到购物车')
  }
}

// 立即购买
const buyNow = () => {
  if (product.value) {
    // 先将商品添加到购物车
    cartStore.addToCart(product.value, quantity.value)
    // 然后跳转到结算页面
    router.push('/checkout')
  }
}
</script>