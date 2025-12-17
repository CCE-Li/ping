<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- 页面标题 -->
    <div class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-xl font-bold text-gray-800">商品分类</h1>
      </div>
    </div>
    
    <!-- 分类内容 -->
    <div class="container mx-auto px-4 py-6">
      <!-- 分类搜索 -->
      <div class="mb-6">
        <div class="relative">
          <input 
            type="text" 
            placeholder="搜索商品或分类..." 
            class="w-full py-3 px-4 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <!-- 分类导航 -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex overflow-x-auto space-x-4 pb-2 -mx-1 px-1 hide-scrollbar">
          <button 
            v-for="category in categories" 
            :key="category.id"
            class="px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300"
            :class="selectedCategory === category.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            @click="selectedCategory = category.id"
          >
            {{ category.name }}
          </button>
        </div>
      </div>
      
      <!-- 分类内容展示 -->
      <div v-if="currentCategoryProducts.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div 
          v-for="product in currentCategoryProducts" 
          :key="product.id"
          class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          @click="goToDetail(product.id)"
        >
          <div class="h-40 bg-gray-50 flex items-center justify-center relative">
            <img :src="product.image" alt="商品图片" class="max-w-full max-h-full object-contain p-1 z-10 relative">
          </div>
          <div class="p-3">
            <h3 class="text-sm font-medium text-gray-800 line-clamp-2 mb-1 h-10">
              {{ product.name }}
            </h3>
            <p class="text-secondary font-bold">{{ formatPrice(product.price) }}</p>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="bg-white rounded-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-500">暂无相关商品</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { productApi, categoryApi } from '../utils/api'
import { formatPrice } from '../utils/productDataUtils'

const router = useRouter()
const selectedCategory = ref('')
const categories = ref([{ id: '', name: '全部分类' }])
const products = ref([])
const loading = ref(false)

// 从API获取数据
const fetchData = async () => {
  try {
    loading.value = true
    // 获取分类数据
    const categoriesResponse = await categoryApi.getAll()
    categories.value = [
      { id: '', name: '全部分类' },
      ...(categoriesResponse.results || [])
    ]
    
    // 获取商品数据（后端支持 category_id 过滤）
    const categoryId = selectedCategory.value || null
    const productsResponse = await productApi.getAll(1, categoryId)
    products.value = productsResponse.results || []
  } catch (error) {
    console.error('获取分类和商品数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

watch(selectedCategory, () => {
  fetchData()
})

// 根据选中的分类筛选商品
const currentCategoryProducts = computed(() => {
  return products.value
})

// 跳转到商品详情
const goToDetail = (productId) => {
  router.push(`/product/${productId}`)
}
</script>

<style scoped>
/* 隐藏滚动条但保留功能 */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>