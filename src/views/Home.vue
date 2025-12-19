<template>
  <el-container class="home-page">
    <el-header class="home-header" height="460px">
      <el-carousel height="460px" indicator-position="outside" autoplay :interval="6000" @mouseenter="pauseSlideTimer" @mouseleave="resumeSlideTimer">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner" :style="{ backgroundImage: `url(${banner.image})` }">
            <div class="banner-mask">
              <div class="banner-content">
                <div class="banner-title">{{ banner.title }}</div>
                <div class="banner-desc">{{ banner.description || '限时优惠，立即抢购！' }}</div>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </el-header>

    <el-main class="home-main">
      <el-row :gutter="16" class="home-toolbar">
        <el-col :xs="24" :md="16">
          <el-input v-model="searchKeyword" clearable placeholder="搜索商品名称/描述..." @keyup.enter="handleSearch">
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :md="8" class="toolbar-right">
          <el-text type="info">共 {{ totalCount }} 件</el-text>
        </el-col>
      </el-row>

      <el-card class="home-section" shadow="never">
        <template #header>
          <div class="section-header">
            <el-text tag="b">热门分类</el-text>
            <router-link to="/category">
              <el-button link type="primary">查看全部</el-button>
            </router-link>
          </div>
        </template>
        <el-row :gutter="12">
          <el-col v-for="category in featuredCategories" :key="category.id" :xs="12" :sm="8" :md="6" :lg="4">
            <el-card class="category-card" shadow="hover" @click="selectedCategory = category.id">
              <div class="category-name">{{ category.name }}</div>
              <el-text type="info" size="small">{{ category.count }} 件商品</el-text>
            </el-card>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="home-section" shadow="never">
        <template #header>
          <div class="section-header">
            <el-text tag="b">分类筛选</el-text>
          </div>
        </template>
        <el-segmented v-model="selectedCategory" :options="categoryOptions" size="default" />
      </el-card>

      <el-card class="home-section" shadow="never">
        <template #header>
          <div class="section-header">
            <el-text tag="b">{{ getCategoryName(selectedCategory) }}商品</el-text>
          </div>
        </template>

        <el-row :gutter="16">
          <el-col v-for="product in filteredProducts" :key="product.id" :xs="12" :sm="12" :md="8" :lg="6" :xl="6">
            <el-card class="product-card" shadow="hover" @click="goToDetail(product.id)">
              <template #header>
                <div class="product-header">
                  <el-tag v-if="product.discount" type="danger" size="small" effect="dark">{{ product.discount }}折</el-tag>
                  <el-text class="product-title" truncated>{{ product.name }}</el-text>
                </div>
              </template>

              <div class="product-body">
                <div class="product-image-wrap">
                  <img :src="product.image" alt="商品图片" class="product-image" />
                </div>
                <el-text type="info" class="product-desc" truncated>{{ product.description }}</el-text>
                <div class="product-footer">
                  <div class="product-price">
                    <el-text type="danger" tag="b">{{ formatPrice(product.discount ? product.discountPrice : product.price) }}</el-text>
                    <el-text v-if="product.discount" type="info" class="product-origin">{{ formatPrice(product.originalPrice) }}</el-text>
                  </div>
                  <div class="product-actions" @click.stop>
                    <el-button size="small" @click="quickView(product)">快速查看</el-button>
                    <el-button size="small" type="primary" @click="addToCart(product)">加入购物车</el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <div class="load-more">
          <el-button v-if="hasMoreProducts" type="primary" plain @click="loadMore">加载更多</el-button>
        </div>
      </el-card>

      <el-dialog v-model="quickViewVisible" width="860px" :title="quickViewProduct?.name || '快速查看'" @closed="closeQuickView">
        <el-row :gutter="16" v-if="quickViewProduct">
          <el-col :xs="24" :md="12">
            <div class="dialog-image-wrap">
              <img :src="quickViewProduct.image" :alt="quickViewProduct.name" class="dialog-image" />
            </div>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-text type="info">{{ quickViewProduct.description }}</el-text>
            <div class="dialog-price">
              <el-text type="danger" tag="b">¥{{ parseFloat(quickViewProduct.price || 0).toFixed(2) }}</el-text>
            </div>
            <el-button type="primary" class="dialog-btn" @click="addToCart(quickViewProduct)">加入购物车</el-button>
            <el-button class="dialog-btn" @click="goToDetail(quickViewProduct.id); closeQuickView()">查看详情</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { productApi, categoryApi } from '../utils/api'
import { getProductCategoryName, formatPrice, transformProductsData } from '../utils/productDataUtils'
import { ElMessage } from 'element-plus'

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
const quickViewVisible = ref(false)
const products = ref([])
const currentPage = ref(1)
const totalCount = ref(0)
const hasMoreProducts = ref(true)
const searchKeyword = ref('')
const activeKeyword = ref('')

const categoryOptions = computed(() => {
  return (categories.value || []).map(c => ({ label: c.name, value: c.id }))
})

const fetchCategoryCount = async (categoryId) => {
  const resp = await productApi.getAll(1, categoryId, null, 1)
  return resp.count || 0
}

// 从API获取数据
const fetchData = async (reset = false) => {
  try {
    if (reset) {
      currentPage.value = 1;
      products.value = [];
      totalCount.value = 0;
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
    
    const productsResponse = await productApi.getAll(currentPage.value, selectedCategoryId, activeKeyword.value || null, 20);
    const newProducts = productsResponse.results || [];
    const transformedProducts = transformProductsData(newProducts);

    products.value = reset ? transformedProducts : [...products.value, ...transformedProducts];
    
    currentPage.value += 1;
    totalCount.value = productsResponse.count || 0;
    hasMoreProducts.value = products.value.length < totalCount.value;
    
    // 创建特色分类（从分类中选择前几个）
    const featuredBase = categories.value
      .filter(c => c.id !== '')
      .slice(0, 5)

    const featuredCounts = await Promise.all(
      featuredBase.map(c => fetchCategoryCount(c.id))
    )

    featuredCategories.value = featuredBase.map((category, idx) => ({
      id: category.id,
      name: category.name,
      count: featuredCounts[idx] || 0,
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
  document.body.style.overflow = quickViewVisible.value ? 'hidden' : ''
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

watch(quickViewVisible, (val) => {
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
  const pid = Number(product?.id)
  if (!pid) {
    ElMessage.error('商品信息异常，加入购物车失败')
    return
  }

  const finalPrice = product?.discount ? (Number(product?.discountPrice) || Number(product?.price) || 0) : (Number(product?.price) || 0)
  cartStore.addToCart({
    ...product,
    id: pid,
    price: finalPrice,
  })
  ElMessage.success('已成功添加到购物车！')
}

const quickView = (product) => {
  quickViewProduct.value = product
  quickViewVisible.value = true
}

const closeQuickView = () => {
  quickViewVisible.value = false
  quickViewProduct.value = null
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
}
.home-header {
  padding: 0;
}
.home-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}
.home-toolbar {
  margin-bottom: 16px;
}
.toolbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.home-section {
  margin-bottom: 16px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.banner {
  height: 460px;
  background-size: cover;
  background-position: center;
}
.banner-mask {
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.1));
  display: flex;
  align-items: center;
}
.banner-content {
  padding-left: 48px;
  color: #fff;
  max-width: 520px;
}
.banner-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
}
.banner-desc {
  font-size: 16px;
  opacity: 0.92;
  margin-bottom: 18px;
}
.category-card {
  cursor: pointer;
  text-align: center;
}
.category-name {
  font-weight: 600;
  margin-bottom: 6px;
}
.product-card {
  cursor: pointer;
}
.product-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.product-title {
  flex: 1;
}
.product-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.product-image-wrap {
  height: 180px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.product-desc {
  min-height: 22px;
}
.product-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
}
.product-price {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.product-origin {
  text-decoration: line-through;
  font-size: 12px;
}
.product-actions {
  display: flex;
  gap: 8px;
}
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
.dialog-image-wrap {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
}
.dialog-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.dialog-price {
  margin: 16px 0;
}
.dialog-btn {
  width: 100%;
  margin-bottom: 10px;
}
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