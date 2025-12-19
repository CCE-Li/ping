<template>
  <div class="category-page min-h-screen bg-gray-50 py-8">
    <div class="wrapper">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">商品分类</h1>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="category-item card cursor-pointer transform transition-all duration-300 hover:-translate-y-1"
            @click="selectCategory(category)"
          >
            <div class="p-4 text-center">
              <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-primary text-2xl">{{ category.icon || '📦' }}</span>
              </div>
              <h3 class="font-medium text-gray-800">{{ category.name }}</h3>
              <p class="text-xs text-gray-500 mt-1">{{ category.count }} 件商品</p>
            </div>
          </div>
        </div>
        
        <div v-if="selectedCategory" class="mt-8">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">
            {{ selectedCategory.name }} 商品
          </h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div 
              v-for="product in categoryProducts" 
              :key="product.id"
              class="product-card card cursor-pointer"
              @click="goToProduct(product.id)"
            >
              <div class="h-40 bg-gray-100 flex items-center justify-center">
                <img :src="product.image" alt="商品图片" class="max-w-full max-h-full object-contain p-1">
              </div>
              <div class="p-4">
                <h3 class="font-medium text-gray-800 mb-1 truncate">{{ product.name }}</h3>
                <p class="text-sm text-gray-500 mb-3 h-10 overflow-hidden">{{ product.description }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-red-500 font-bold">{{ formatPrice(product.price) }}</span>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click.stop="addToCart(product)"
                  >
                    加入购物车
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { ElMessage } from 'element-plus'
import { productApi, categoryApi } from '../utils/api'
import { formatPrice } from '../utils/productDataUtils'

const router = useRouter()
const cartStore = useCartStore()

const selectedCategory = ref(null)
const categories = ref([])
const allProducts = ref([])
const loading = ref(false)
const loadError = ref('')

// 从API获取数据
const fetchData = async () => {
  try {
    loading.value = true
    loadError.value = ''
    // 获取分类数据
    const categoriesResponse = await categoryApi.getAll()
    categories.value = (categoriesResponse.results || []).map(category => ({
      ...category,
      count: 0, // 后续统计实际商品数量
      icon: getIconForCategory(category.name)
    }))
    
    // 获取所有商品数据
    const productsResponse = await productApi.getAll()
    allProducts.value = productsResponse.results || []
    
    // 统计每个分类的商品数量
    updateCategoryCounts()
  } catch (error) {
    console.error('获取分类和商品数据失败:', error)
    loadError.value = error?.message || '获取分类或商品失败'
  } finally {
    loading.value = false
  }
}

// 根据分类名称获取对应图标
const getIconForCategory = (name) => {
  const iconMap = {
    '电子产品': '📱',
    '家居用品': '🏠',
    '服装配饰': '👕',
    '美妆护肤': '💄',
    '运动户外': '⚽',
    '图书文具': '📚',
    '食品饮料': '🍎',
    '汽车用品': '🚗'
  }
  return iconMap[name] || '📦'
}

// 更新分类商品计数
const updateCategoryCounts = () => {
  categories.value.forEach(category => {
    const count = allProducts.value.filter(product => product.category_id === category.id).length
    category.count = count
  })
}

// 选择分类
const selectCategory = (category) => {
  selectedCategory.value = category
}

// 计算当前分类的商品
const categoryProducts = computed(() => {
  if (!selectedCategory.value) return []
  return allProducts.value.filter(
    product => product.category_id === selectedCategory.value.id
  )
})

// 跳转到商品详情
const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

// 加入购物车
const addToCart = (product) => {
  cartStore.addToCart(product)
  ElMessage.success(`${product.name} 已添加到购物车`)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.category-page {
  min-height: calc(100vh - 140px);
}

.category-item:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.product-card:hover {
  transform: translateY(-5px);
}
</style>