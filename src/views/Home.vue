<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- 轮播图组件 - 优化视觉效果 -->
    <div 
      class="relative w-full h-80 md:h-[450px] lg:h-[550px] overflow-hidden"
      @mouseenter="pauseSlideTimer"
      @mouseleave="resumeSlideTimer"
    >
      <!-- 轮播图片容器 -->
      <div 
        class="absolute inset-0 transition-transform duration-1000 ease-out" 
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <div class="flex h-full">
          <div v-for="banner in banners" :key="banner.id" class="min-w-full relative">
            <!-- 轮播图背景图片 -->
            <img :src="banner.image" alt="Banner" class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-3000">
            <!-- 渐变遮罩 -->
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 flex items-center">
              <div class="container mx-auto px-8 md:px-16 max-w-xl">
                <h2 class="text-white text-3xl md:text-5xl lg:text-[clamp(2.5rem,5vw,4rem)] font-bold mb-4 tracking-tight">
                  {{ banner.title }}
                </h2>
                <p class="text-white/90 text-lg mb-6 md:text-xl">
                  {{ banner.description || '限时优惠，立即抢购！' }}
                </p>
                <button class="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform">
                  立即查看
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 轮播指示器 -->
      <div class="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
        <button 
          v-for="(banner, index) in banners" 
          :key="banner.id"
          class="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-500 ease-out"
          :class="index === currentSlide ? 'bg-white w-10 md:w-12' : 'bg-white/50 hover:bg-white/80'"
          @click="currentSlide = index"
          @keydown.enter="currentSlide = index"
          @keydown.space.prevent="currentSlide = index"
          aria-label="切换到轮播图 {{ index + 1 }}"
        ></button>
      </div>
      <!-- 左右切换按钮 -->
      <button 
        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        @click="prevSlide"
        aria-label="上一张"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button 
        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        @click="nextSlide"
        aria-label="下一张"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- 主内容区域 -->
    <div class="container mx-auto px-4 py-12">
      <!-- 搜索栏 -->
      <div class="mb-10">
        <div class="max-w-2xl">
          <div class="relative">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索商品名称/描述..."
              class="w-full py-3 px-4 pl-10 pr-24 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              @keydown.enter.prevent="handleSearch"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div class="absolute right-2 top-2 flex items-center gap-2">
              <button
                v-if="searchKeyword"
                type="button"
                class="text-sm text-gray-500 hover:text-gray-700 px-2"
                @click="clearSearch"
              >
                清除
              </button>
              <button
                type="button"
                class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium"
                @click="handleSearch"
              >
                搜索
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 特色分类展示 -->
      <section class="mb-16">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">热门分类</h2>
          <router-link to="/category" class="text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            查看全部
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </router-link>
        </div>
        
        <!-- 分类网格 -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div 
            v-for="category in featuredCategories" 
            :key="category.id"
            class="relative rounded-xl overflow-hidden shadow-md group h-40 md:h-48 cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-gray-100"
            @click="selectedCategory = category.id"
          >
            <div class="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div class="p-4 w-full">
                <h3 class="text-white font-bold text-lg">{{ category.name }}</h3>
                <p class="text-white/80 text-sm">{{ category.count }} 件商品</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 分类筛选 -->
      <div class="mb-10">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 class="text-xl font-semibold text-gray-800">商品筛选</h3>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">排序:</span>
            <select class="form-select px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
              <option>推荐</option>
              <option>价格: 从低到高</option>
              <option>价格: 从高到低</option>
              <option>最新上架</option>
            </select>
          </div>
        </div>
        
        <!-- 分类按钮列表 -->
        <div class="flex flex-wrap gap-2 mb-8">
          <button 
            v-for="category in categories" 
            :key="category.id"
            class="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
            :class="selectedCategory === category.id 
              ? 'bg-primary text-white shadow-md scale-105' 
              : 'bg-white border border-gray-200 text-gray-700 hover:border-primary/30 hover:shadow-sm'"
            @click="selectedCategory = category.id"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- 商品列表 -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-800">
            {{ getCategoryName(selectedCategory) }}商品
          </h3>
          <span class="text-sm font-medium text-gray-500">
            共 {{ filteredProducts.length }} 件
          </span>
        </div>
        
        <!-- 商品网格布局 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/10 group cursor-pointer"
            @click="goToDetail(product.id)"
          >
            <!-- 商品标签 -->
            <div class="absolute top-3 left-3 z-10">
              <span v-if="product.discount" class="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                {{ product.discount }}折
              </span>
            </div>
            
            <!-- 商品图片容器 -->
            <div class="h-52 bg-gray-50 overflow-hidden relative flex items-center justify-center p-4">
              <img 
                :src="product.image" 
                alt="商品图片" 
                class="max-w-full max-h-full object-contain transform transition-transform duration-700 group-hover:scale-110"
              >
              <!-- 快速操作按钮 -->
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button 
                  class="bg-white text-gray-800 p-2 rounded-full shadow-md mx-1 transform transition-transform duration-300 hover:scale-110 hover:bg-primary hover:text-white"
                  @click.stop="addToCart(product)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </button>
                <button 
                  class="bg-white text-gray-800 p-2 rounded-full shadow-md mx-1 transform transition-transform duration-300 hover:scale-110 hover:bg-primary hover:text-white"
                  @click.stop="quickView(product)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- 商品信息区域 -->
            <div class="p-5">
              <div class="flex items-center text-xs text-yellow-400 mb-2">
                <span v-for="n in 5" :key="n" class="mr-0.5">★</span>
                <span class="ml-2 text-gray-500">{{ product.rating || 5.0 }}</span>
              </div>
              <h4 class="font-medium mb-2 line-clamp-2 text-gray-800 hover:text-primary transition-colors">{{ product.name }}</h4>
              <p class="text-gray-500 text-sm mb-4 line-clamp-2 h-12">{{ product.description }}</p>
              <div class="flex justify-between items-center">
                <div>
                  <span v-if="product.discount" class="text-lg font-bold text-secondary">{{ formatPrice(product.discountPrice) }}</span>
                  <span v-else class="text-lg font-bold text-secondary">{{ formatPrice(product.price) }}</span>
                  <span v-if="product.discount" class="text-sm text-gray-400 line-through ml-2">{{ formatPrice(product.originalPrice) }}</span>
                </div>
                <button 
                  class="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300"
                  @click.stop="addToCart(product)"
                >
                  加入购物车
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 加载更多按钮 -->
        <div class="mt-12 text-center">
          <button v-if="hasMoreProducts" @click="loadMore" class="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium transition-all duration-300 inline-flex items-center gap-2">
            加载更多
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 快速查看弹窗 -->
    <div 
      v-if="quickViewProduct" 
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click="closeQuickView"
    >
      <div class="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto" @click.stop>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div class="h-72 bg-gray-50 flex items-center justify-center">
            <img :src="quickViewProduct.image" :alt="quickViewProduct.name" class="max-w-full max-h-full object-contain">
          </div>
          <div>
            <h3 class="text-2xl font-bold mb-3">{{ quickViewProduct.name }}</h3>
            <p class="text-gray-600 mb-4">{{ quickViewProduct.description }}</p>
            <div class="flex items-center mb-4">
              <span class="text-2xl font-bold text-secondary">¥{{ parseFloat(quickViewProduct.price || 0).toFixed(2) }}</span>
            </div>
            <button 
              class="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 w-full mb-3"
              @click="addToCart(quickViewProduct); closeQuickView()"
            >
              加入购物车
            </button>
            <button 
              class="border border-gray-300 hover:border-primary hover:text-primary text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-300 w-full"
              @click="goToDetail(quickViewProduct.id); closeQuickView()"
            >
              查看详情
            </button>
          </div>
        </div>
        <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700" @click="closeQuickView">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { productApi, categoryApi } from '../utils/api'
import { getProductCategoryName, formatPrice, transformProductsData } from '../utils/productDataUtils'

const router = useRouter()
const cartStore = useCartStore()

const banners = ref([
  { id: 1, title: '新品上市', image: 'https://picsum.photos/id/26/1200/500', description: '探索最新科技产品，引领时尚潮流' },
  { id: 2, title: '限时特惠', image: 'https://picsum.photos/id/96/1200/500', description: '全场商品低至5折，错过再等一年' },
  { id: 3, title: '爆款推荐', image: 'https://picsum.photos/id/24/1200/500', description: '热销商品限时抢购，品质保证' }
])

const currentSlide = ref(0)
const categories = ref([])
const featuredCategories = ref([])
const selectedCategory = ref('')
const quickViewProduct = ref(null)
const products = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const hasMoreProducts = ref(true)
const searchKeyword = ref('')
const activeKeyword = ref('')

// 从API获取数据
const fetchData = async (reset = false) => {
  try {
    if (reset) {
      currentPage.value = 1;
      products.value = [];
      hasMoreProducts.value = true;
    }
    
    if (!hasMoreProducts.value) return;
    
    const categoriesResponse = await categoryApi.getAll();
    categories.value = [
      { id: '', name: '全部分类' },
      ...(categoriesResponse.results || [])
    ];
    
    // 如果有分类，确保selectedCategory有一个有效的值
    if (categories.value.length > 0) {
      if (!categories.value.some(cat => String(cat.id) === String(selectedCategory.value))) {
        selectedCategory.value = '';
      }
    }
    
    // 后端按 category_id 过滤
    const selectedCategoryId = selectedCategory.value
    
    const productsResponse = await productApi.getAll(currentPage.value, selectedCategoryId, activeKeyword.value || null);
    const newProducts = productsResponse.results || [];
    const transformedProducts = transformProductsData(newProducts);

    products.value = reset ? transformedProducts : [...products.value, ...transformedProducts];
    
    currentPage.value += 1;
    totalPages.value = Math.ceil((productsResponse.count || 0) / 10);
    hasMoreProducts.value = currentPage.value <= totalPages.value;
    
    // 创建特色分类（从分类中选择前几个）
    featuredCategories.value = categories.value
      .filter(c => c.id !== '')
      .slice(0, 5)
      .map(category => ({
      id: category.id,
      name: category.name,
      count: products.value.filter(p => String(p.category?.id) === String(category.id)).length,
      image: `https://picsum.photos/id/${category.id + 10}/300/300` // 使用分类ID作为图片ID
    }));
  } catch (error) {
    console.error('获取数据失败:', error);
    hasMoreProducts.value = false;
  }
};

// 根据选择的分类筛选商品
const filteredProducts = computed(() => {
  // 如果没有商品，返回空数组
  if (!products.value || products.value.length === 0) {
    return [];
  }
  
  // 确保products数组中的商品都有category字段
  const validProducts = products.value.filter(p => p.category && p.category.name);
  
  // 由于商品数据已经在API请求时根据分类名称进行了筛选，直接返回所有有效的商品
  // 这样可以避免二次筛选导致的问题
  return validProducts;
})

// 定义商品映射，用于快速查找商品信息
const productMap = computed(() => {
  const map = {}
  products.value.forEach(product => {
    map[product.id] = product
  })
  return map
})

// 定义分类映射，用于快速查找分类名称
const categoryMap = computed(() => {
  const map = {}
  categories.value.forEach(category => {
    map[category.id] = category.name
  })
  return map
})

// 根据分类ID获取分类名称
const getCategoryName = (id) => categoryMap.value[id] || ''

let slideTimer = null

onMounted(() => {
  startSlideTimer()
  fetchData()
  document.body.style.overflow = quickViewProduct.value ? 'hidden' : ''
})

// 监听分类变化，重新获取商品数据
watch(selectedCategory, () => {
  fetchData(true)
})

watch(activeKeyword, () => {
  fetchData(true)
})

const handleSearch = () => {
  activeKeyword.value = searchKeyword.value.trim()
}

const clearSearch = () => {
  searchKeyword.value = ''
  activeKeyword.value = ''
}

// 加载更多商品
const loadMore = () => {
  fetchData(false)
}

onUnmounted(() => {
  if (slideTimer) clearInterval(slideTimer)
})

watch(quickViewProduct, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

// 开始轮播计时器
const startSlideTimer = () => {
  slideTimer = setInterval(nextSlide, 6000)
}

// 暂停轮播计时器
const pauseSlideTimer = () => {
  if (slideTimer) clearInterval(slideTimer)
}

// 恢复轮播计时器
const resumeSlideTimer = () => {
  startSlideTimer()
}

// 下一张轮播图
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % banners.value.length
}

// 上一张轮播图
const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + banners.value.length) % banners.value.length
}

// 跳转到商品详情页
const goToDetail = (id) => {
  router.push(`/product/${id}`)
}

// 添加到购物车
const addToCart = (product) => {
  cartStore.addToCart(product)
  // TODO: 替换为 Toast 提示
  alert('🎉 已成功添加到购物车！')
}

const quickView = (product) => {
  quickViewProduct.value = product
}

const closeQuickView = () => {
  quickViewProduct.value = null
}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
html {
  scroll-behavior: smooth;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
</style>