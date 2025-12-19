<template>
  <el-container class="category-page">
    <el-main class="category-main">
      <el-card class="category-head" shadow="never">
        <template #header>
          <div class="category-head-row">
            <el-text tag="b">商品分类</el-text>
            <el-text type="info">共 {{ totalCount }} 件</el-text>
          </div>
        </template>

        <el-row :gutter="12">
          <el-col :xs="24" :md="16">
            <el-input v-model="searchKeyword" clearable placeholder="搜索商品或分类..." @keyup.enter="handleSearch">
              <template #append>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
              </template>
            </el-input>
          </el-col>
        </el-row>

        <div class="category-seg">
          <el-segmented v-model="selectedCategory" :options="categoryOptions" />
        </div>
      </el-card>

      <el-card v-if="loading" class="category-section" shadow="never">
        <el-skeleton :rows="6" animated />
      </el-card>

      <el-card v-else-if="loadError" class="category-section" shadow="never">
        <el-alert :title="loadError" type="error" show-icon />
        <div class="retry-row">
          <el-button type="primary" plain @click="fetchData(true)">重试</el-button>
        </div>
      </el-card>

      <el-card v-else class="category-section" shadow="never">
        <el-row :gutter="16" v-if="products.length">
          <el-col v-for="product in products" :key="product.id" :xs="12" :sm="12" :md="8" :lg="6" :xl="6">
            <el-card class="product-card" shadow="hover" @click="goToDetail(product.id)">
              <template #header>
                <div class="product-header">
                  <el-text class="product-title" truncated>{{ product.name }}</el-text>
                </div>
              </template>
              <div class="product-body">
                <div class="product-image-wrap">
                  <img :src="product.image" alt="商品图片" class="product-image" />
                </div>
                <div class="product-footer">
                  <el-text type="danger" tag="b">{{ formatPrice(product.price) }}</el-text>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-else description="暂无相关商品" />

        <div class="load-more">
          <el-button v-if="hasMoreProducts" type="primary" plain @click="loadMore">加载更多</el-button>
        </div>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { productApi, categoryApi } from '../utils/api'
import { formatPrice } from '../utils/productDataUtils'
import { ElMessage } from 'element-plus'

const router = useRouter()
const selectedCategory = ref('')
const categories = ref([{ id: '', name: '全部分类' }])
const products = ref([])
const currentPage = ref(1)
const totalCount = ref(0)
const hasMoreProducts = ref(true)
const loading = ref(false)
const loadError = ref('')
const searchKeyword = ref('')

const categoryOptions = computed(() => {
  return (categories.value || []).map(c => ({ label: c.name, value: c.id }))
})

// 从API获取数据
const fetchData = async (reset = false) => {
  try {
    loading.value = true
    loadError.value = ''
    if (reset) {
      currentPage.value = 1
      products.value = []
      totalCount.value = 0
      hasMoreProducts.value = true
    }
    // 获取分类数据
    const categoriesResponse = await categoryApi.getAll()
    categories.value = [
      { id: '', name: '全部分类' },
      ...(categoriesResponse.results || [])
    ]
    
    // 获取商品数据（后端支持 category_id / keyword 过滤）
    const categoryId = selectedCategory.value || null
    const keyword = searchKeyword.value.trim() || null
    const productsResponse = await productApi.getAll(currentPage.value, categoryId, keyword, 20)
    const newProducts = productsResponse.results || []
    products.value = reset ? newProducts : [...products.value, ...newProducts]

    currentPage.value += 1
    totalCount.value = productsResponse.count || 0
    hasMoreProducts.value = products.value.length < totalCount.value
  } catch (error) {
    console.error('获取分类和商品数据失败:', error)
    loadError.value = error?.message || '获取分类或商品失败'
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  await fetchData(true)
}

const clearSearch = async () => {
  searchKeyword.value = ''
  await fetchData(true)
}

const handleCategoryClick = async (categoryId) => {
  selectedCategory.value = categoryId
  await fetchData(true)
}

onMounted(() => {
  fetchData(true)
})

watch(selectedCategory, () => {
  fetchData(true)
})

const loadMore = () => {
  fetchData(false)
}

// 跳转到商品详情
const goToDetail = (productId) => {
  router.push(`/product/${productId}`)
}
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  background: #f5f7fa;
}
.category-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}
.category-head {
  margin-bottom: 16px;
}
.category-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.category-seg {
  margin-top: 12px;
}
.category-section {
  margin-bottom: 16px;
}
.retry-row {
  margin-top: 12px;
}
.product-card {
  cursor: pointer;
}
.product-header {
  display: flex;
  align-items: center;
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
.product-footer {
  display: flex;
  justify-content: space-between;
}
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>