<template>
  <div class="shopping-container">
    <!-- 头部搜索区域 -->
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <h2>购物商城</h2>
        </div>
        <div class="search-bar">
          <el-input 
            placeholder="请输入商品名称" 
            v-model="searchKeyword" 
            size="large"
            class="search-input"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
        <div class="user-actions">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button @click="register">注册</el-button>
          <el-badge :value="cartCount" class="cart-icon" @click="$router.push('/cart')">
            <el-icon :size="24"><ShoppingCart /></el-icon>
          </el-badge>
        </div>
      </div>
    </el-header>

    <!-- 分类导航 -->
    <el-menu 
      :default-active="activeCategory" 
      class="category-nav" 
      mode="horizontal" 
      @select="handleCategorySelect"
    >
      <el-menu-item index="all">全部商品</el-menu-item>
      <el-menu-item index="electronics">数码电子</el-menu-item>
      <el-menu-item index="clothing">服装鞋包</el-menu-item>
      <el-menu-item index="home">家居用品</el-menu-item>
      <el-menu-item index="beauty">美妆护肤</el-menu-item>
      <el-menu-item index="sports">运动户外</el-menu-item>
    </el-menu>

    <!-- 主体内容 -->
    <el-main class="main-content">
      <!-- 侧边栏筛选 -->
      <el-aside width="200px" class="sidebar">
        <el-card class="filter-card">
          <template #header>
            <div class="card-header">
              <span>价格筛选</span>
            </div>
          </template>
          <el-slider 
            v-model="priceRange" 
            range 
            :max="1000" 
            :min="0"
            @change="handlePriceFilter"
          />
          <div class="price-display">
            ¥{{ priceRange[0] }} - ¥{{ priceRange[1] }}
          </div>
        </el-card>

        <el-card class="filter-card">
          <template #header>
            <div class="card-header">
              <span>品牌筛选</span>
            </div>
          </template>
          <el-checkbox-group v-model="selectedBrands" @change="handleBrandFilter">
            <div v-for="brand in brands" :key="brand" class="brand-checkbox">
              <el-checkbox :label="brand" :value="brand">{{ brand }}</el-checkbox>
            </div>
          </el-checkbox-group>
        </el-card>
      </el-aside>

      <!-- 商品列表 -->
      <el-container class="product-container">
        <!-- 排序选项 -->
        <div class="sort-options">
          <el-radio-group v-model="sortBy" @change="handleSortChange">
            <el-radio-button label="default">综合排序</el-radio-button>
            <el-radio-button label="sales">销量优先</el-radio-button>
            <el-radio-button label="price-low">价格从低到高</el-radio-button>
            <el-radio-button label="price-high">价格从高到低</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 商品网格 -->
        <el-row :gutter="20" class="product-grid">
          <el-col 
            v-for="product in displayedProducts" 
            :key="product.id" 
            :span="6" 
            class="product-col"
          >
            <el-card 
              :body-style="{ padding: '0px' }" 
              class="product-card"
              shadow="hover"
            >
              <div class="product-image-container">
                <img 
                  :src="product.image" 
                  :alt="product.name" 
                  class="product-image"
                  @click="viewProductDetail(product)"
                >
              </div>
              <div class="product-info">
                <div class="product-title" @click="viewProductDetail(product)">
                  {{ product.name }}
                </div>
                <div class="product-price">¥{{ product.price }}</div>
                <div class="product-sales">销量: {{ product.sales }}件</div>
                <div class="product-store">{{ product.store }}</div>
                <div class="product-actions">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="addToCart(product)"
                  >
                    加入购物车
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[8, 16, 24, 32]"
            :small="false"
            :disabled="false"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalProducts"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-container>
    </el-main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ShoppingCart } from '@element-plus/icons-vue'

const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 当前激活的分类
const activeCategory = ref('all')

// 价格范围筛选
const priceRange = ref([0, 300])

// 选中的品牌
const selectedBrands = ref([])

// 品牌列表
const brands = ref(['苹果', '华为', '小米', '三星', 'OPPO', 'VIVO'])

// 排序方式
const sortBy = ref('default')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(8)
const totalProducts = ref(100)

// 购物车商品数量
const cartCount = ref(3)

// 商品数据（模拟数据）
const products = ref([
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    price: 9999,
    sales: 12800,
    store: '官方旗舰店',
    image: 'https://via.placeholder.com/300x300?text=iPhone+15'
  },
  {
    id: 2,
    name: '华为 Mate60 Pro 512GB',
    price: 6999,
    sales: 8500,
    store: '华为官方店',
    image: 'https://via.placeholder.com/300x300?text=Mate60'
  },
  {
    id: 3,
    name: '小米 14 Ultra 1TB',
    price: 5999,
    sales: 6400,
    store: '小米官方店',
    image: 'https://via.placeholder.com/300x300?text=Xiaomi+14'
  },
  {
    id: 4,
    name: 'Samsung Galaxy S24 Ultra',
    price: 8999,
    sales: 5200,
    store: '三星官方店',
    image: 'https://via.placeholder.com/300x300?text=S24+Ultra'
  },
  {
    id: 5,
    name: 'OPPO Find X7 Ultra',
    price: 5499,
    sales: 4300,
    store: 'OPPO官方店',
    image: 'https://via.placeholder.com/300x300?text=Find+X7'
  },
  {
    id: 6,
    name: 'vivo X100 Pro 512GB',
    price: 4999,
    sales: 3800,
    store: 'vivo官方店',
    image: 'https://via.placeholder.com/300x300?text=vivo+X100'
  },
  {
    id: 7,
    name: '一加 12 256GB',
    price: 3999,
    sales: 2900,
    store: '一加官方店',
    image: 'https://via.placeholder.com/300x300?text=OnePlus+12'
  },
  {
    id: 8,
    name: '魅族 21 Note 256GB',
    price: 2999,
    sales: 1800,
    store: '魅族官方店',
    image: 'https://via.placeholder.com/300x300?text=Meizu+21'
  }
])

// 显示的商品列表
const displayedProducts = ref(products.value.slice(0, 8))

// 搜索处理
const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value)
  // 这里会在后续用爬虫替换真实数据
}

// 登录处理
const login = () => {
  console.log('用户登录')
}

// 注册处理
const register = () => {
  console.log('用户注册')
}

// 分类选择处理
const handleCategorySelect = (index) => {
  activeCategory.value = index
  console.log('选择分类:', index)
}

// 价格筛选处理
const handlePriceFilter = (value) => {
  console.log('价格筛选:', value)
}

// 品牌筛选处理
const handleBrandFilter = (value) => {
  console.log('品牌筛选:', value)
}

// 排序变化处理
const handleSortChange = (value) => {
  console.log('排序方式:', value)
}

// 查看商品详情
const viewProductDetail = (product) => {
  router.push(`/product/${product.id}`)
}

// 加入购物车
const addToCart = (product) => {
  cartCount.value++
  console.log('加入购物车:', product)
  // 这里会实现加入购物车逻辑
}

// 分页大小改变处理
const handleSizeChange = (val) => {
  pageSize.value = val
  console.log('分页大小:', val)
}

// 当前页改变处理
const handleCurrentChange = (val) => {
  currentPage.value = val
  console.log('当前页:', val)
}
</script>

<style scoped>
.shopping-container {
  min-height: 100vh;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  padding: 10px 20px;
}

.logo {
  margin-right: 30px;
}

.search-bar {
  flex: 1;
  max-width: 600px;
  margin-right: 30px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-icon {
  cursor: pointer;
}

.category-nav {
  justify-content: center;
}

.main-content {
  display: flex;
  padding: 20px;
}

.sidebar {
  margin-right: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
}

.brand-checkbox {
  margin: 8px 0;
}

.sort-options {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.product-grid {
  margin-bottom: 20px;
}

.product-col {
  margin-bottom: 20px;
}

.product-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image-container {
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.product-info {
  padding: 14px;
}

.product-title {
  font-size: 14px;
  margin-bottom: 8px;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  cursor: pointer;
}

.product-price {
  color: #ff4444;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.product-sales {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.product-store {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.product-actions {
  text-align: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>