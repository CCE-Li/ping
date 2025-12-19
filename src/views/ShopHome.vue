<template>
  <div class="shop-page">
    <!-- banner 区域 -->
    <div class="banner-section bg-gradient-to-r from-green-400 to-blue-500 py-12 mb-8">
      <div class="wrapper text-center text-white">
        <h1 class="text-4xl font-bold mb-4">欢迎来到购物平台</h1>
        <p class="text-xl">发现最新最好的商品</p>
      </div>
    </div>

    <!-- 商品展示区 -->
    <div class="products-section mb-12">
      <div class="wrapper">
        <h2 class="text-2xl font-bold mb-6 pb-2 border-b text-gray-800">
          热门商品
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div 
            v-for="product in products" 
            :key="product.id"
            class="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            @click="goToProductDetail(product.id)"
          >
            <div class="product-image h-48 bg-gray-200 flex items-center justify-center">
              <div class="text-gray-500">商品图片</div>
            </div>
            <div class="product-info p-4">
              <h3 class="product-title text-lg font-semibold mb-2 truncate text-gray-800">{{ product.name }}</h3>
              <p class="product-description text-gray-600 text-sm mb-3 h-10 overflow-hidden">{{ product.description }}</p>
              <div class="product-actions flex justify-between items-center">
                <span class="product-price text-red-500 font-bold">¥{{ product.price.toFixed(2) }}</span>
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

    <!-- 推荐区域 -->
    <div class="recommend-section bg-gray-100 py-12">
      <div class="wrapper">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
          为您推荐
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="recommend-item bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-semibold mb-2 text-gray-800">品质保证</h3>
            <p class="text-gray-600">我们承诺为您提供最高品质的商品和服务</p>
          </div>
          <div class="recommend-item bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-semibold mb-2 text-gray-800">快速配送</h3>
            <p class="text-gray-600">全国范围内快速配送，让您尽快收到心仪商品</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { ElMessage } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()

// 模拟商品数据
const products = ref([
  {
    id: 1,
    name: '商品一',
    price: 99.99,
    image: '',
    description: '这是商品一的描述信息，高质量的商品值得您的信赖'
  },
  {
    id: 2,
    name: '商品二',
    price: 199.99,
    image: '',
    description: '这是商品二的描述信息，独特设计满足您的个性需求'
  },
  {
    id: 3,
    name: '商品三',
    price: 299.99,
    image: '',
    description: '这是商品三的描述信息，专业品质打造完美体验'
  },
  {
    id: 4,
    name: '商品四',
    price: 399.99,
    image: '',
    description: '这是商品四的描述信息，创新技术带来非凡感受'
  },
  {
    id: 5,
    name: '商品五',
    price: 499.99,
    image: '',
    description: '这是商品五的描述信息，经典款式永不过时'
  },
  {
    id: 6,
    name: '商品六',
    price: 599.99,
    image: '',
    description: '这是商品六的描述信息，高端材质彰显尊贵品味'
  },
  {
    id: 7,
    name: '商品七',
    price: 699.99,
    image: '',
    description: '这是商品七的描述信息，智能科技提升生活品质'
  },
  {
    id: 8,
    name: '商品八',
    price: 799.99,
    image: '',
    description: '这是商品八的描述信息，精美工艺展现艺术美感'
  }
])

const addToCart = (product) => {
  cartStore.addToCart(product)
  ElMessage.success(`${product.name} 已添加到购物车`)
}

const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

onMounted(() => {
  // 页面加载时可以做一些初始化工作
  console.log('Shop home page loaded')
})
</script>

<style scoped>
.shop-page {
  padding: 20px 0;
  flex: 1;
}

.banner-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.recommend-section .wrapper {
  max-width: 1200px;
  margin: 0 auto;
}
</style>