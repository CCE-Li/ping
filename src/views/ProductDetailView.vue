<template>
  <div class="product-detail">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/shopping' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row :gutter="20">
      <!-- 商品图片展示区 -->
      <el-col :span="12">
        <div class="image-preview">
          <el-image 
            :src="currentImage" 
            class="main-image"
            fit="contain"
          />
        </div>
        <div class="image-thumbnails">
          <el-image
            v-for="(image, index) in product.images"
            :key="index"
            :src="image"
            class="thumbnail"
            :class="{ active: image === currentImage }"
            @click="currentImage = image"
            fit="cover"
          />
        </div>
      </el-col>

      <!-- 商品信息区 -->
      <el-col :span="12">
        <div class="product-info">
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-price-section">
            <div class="price-label">价格</div>
            <div class="product-price">¥{{ product.price }}</div>
            <div class="original-price" v-if="product.originalPrice">
              ¥{{ product.originalPrice }}
            </div>
          </div>

          <div class="product-sales">
            <span>销量: {{ product.sales }}件</span>
            <span class="divider">|</span>
            <span>累计评价: {{ product.reviews }}条</span>
          </div>

          <div class="product-express">
            <el-tag type="success">免运费</el-tag>
            <span class="express-text">快递至</span>
            <el-select v-model="deliveryAddress" placeholder="请选择" size="small">
              <el-option
                v-for="item in deliveryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <span class="delivery-time">现货，付款后48小时内发货</span>
          </div>

          <div class="product-selection">
            <div class="selection-item">
              <span class="label">颜色:</span>
              <el-radio-group v-model="selectedColor">
                <el-radio 
                  v-for="color in product.colors" 
                  :key="color" 
                  :label="color"
                  border
                >
                  {{ color }}
                </el-radio>
              </el-radio-group>
            </div>

            <div class="selection-item">
              <span class="label">数量:</span>
              <el-input-number 
                v-model="quantity" 
                :min="1" 
                :max="product.stock" 
                size="small"
              />
              <span class="stock">库存: {{ product.stock }}件</span>
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="primary" size="large" @click="addToCart">
              加入购物车
            </el-button>
            <el-button type="danger" size="large" @click="buyNow">
              立即购买
            </el-button>
          </div>

          <div class="store-info">
            <div class="store-avatar">
              <el-avatar :src="product.store.avatar" />
            </div>
            <div class="store-details">
              <div class="store-name">{{ product.store.name }}</div>
              <div class="store-actions">
                <el-button size="small">进入店铺</el-button>
                <el-button size="small" type="primary" plain>关注店铺</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 商品详情和评价标签页 -->
    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="商品详情" name="detail">
        <div class="product-description" v-html="product.description"></div>
      </el-tab-pane>
      <el-tab-pane label="累计评价 ({{ product.reviews }})" name="reviews">
        <div class="product-reviews">
          <el-empty v-if="!reviews.length" description="暂无评价" />
          <div v-else>
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-user">
                <el-avatar :src="review.user.avatar" size="small" />
                <span class="username">{{ review.user.name }}</span>
                <el-rate v-model="review.rating" disabled />
              </div>
              <div class="review-content">{{ review.content }}</div>
              <div class="review-images" v-if="review.images.length">
                <el-image
                  v-for="(image, index) in review.images"
                  :key="index"
                  :src="image"
                  class="review-image"
                  fit="cover"
                  :preview-src-list="review.images"
                  :initial-index="index"
                />
              </div>
              <div class="review-date">{{ review.date }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="规格参数" name="specs">
        <el-table :data="product.specs" style="width: 100%" border>
          <el-table-column prop="name" label="参数名" width="200" />
          <el-table-column prop="value" label="参数值" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 当前显示的图片
const currentImage = ref('https://via.placeholder.com/400x400?text=Product+Main+Image')

// 选中的颜色
const selectedColor = ref('默认')

// 数量
const quantity = ref(1)

// 当前激活的标签页
const activeTab = ref('detail')

// 配送地址
const deliveryAddress = ref('北京市')

// 配送选项
const deliveryOptions = ref([
  { value: '北京市', label: '北京市' },
  { value: '上海市', label: '上海市' },
  { value: '广州市', label: '广州市' },
  { value: '深圳市', label: '深圳市' }
])

// 商品数据（模拟）
const product = reactive({
  id: 1,
  name: 'iPhone 15 Pro Max 256GB 钛金属色',
  price: 9999,
  originalPrice: 10999,
  sales: 12800,
  reviews: 8650,
  stock: 999,
  images: [
    'https://via.placeholder.com/400x400?text=Image+1',
    'https://via.placeholder.com/400x400?text=Image+2',
    'https://via.placeholder.com/400x400?text=Image+3',
    'https://via.placeholder.com/400x400?text=Image+4'
  ],
  colors: ['黑色', '白色', '蓝色', '钛金属色'],
  store: {
    name: 'Apple官方旗舰店',
    avatar: 'https://via.placeholder.com/50x50?text=Store'
  },
  description: `
    <h2>iPhone 15 Pro Max 产品介绍</h2>
    <p>iPhone 15 Pro Max 是苹果公司最新推出的旗舰手机，拥有革命性的设计和卓越的性能。</p>
    <h3>主要特性：</h3>
    <ul>
      <li>全新钛金属设计，更轻更坚固</li>
      <li>A17 Pro芯片，业界领先的智能手机芯片</li>
      <li>4800万像素主摄，支持5倍光学变焦</li>
      <li>6.7英寸超视网膜XDR显示屏</li>
      <li>USB-C接口，兼容性更强</li>
      <li>动作按钮取代静音开关，自定义功能更多样</li>
    </ul>
    <img src="https://via.placeholder.com/800x400?text=Product+Details" alt="产品细节">
  `,
  specs: [
    { name: '品牌', value: 'Apple' },
    { name: '型号', value: 'iPhone 15 Pro Max' },
    { name: '颜色', value: '钛金属色' },
    { name: '存储容量', value: '256GB' },
    { name: '屏幕尺寸', value: '6.7英寸' },
    { name: '处理器', value: 'A17 Pro芯片' },
    { name: '摄像头', value: '4800万像素主摄 + 1200万像素超广角 + 1200万像素长焦' },
    { name: '电池容量', value: '4441mAh' },
    { name: '操作系统', value: 'iOS 17' },
    { name: '网络制式', value: '5G' }
  ]
})

// 评价数据（模拟）
const reviews = ref([
  {
    id: 1,
    user: {
      name: '张三',
      avatar: 'https://via.placeholder.com/40x40?text=U1'
    },
    rating: 5,
    content: '非常棒的手机，拍照效果超出预期，性能强劲，值得推荐！',
    images: [
      'https://via.placeholder.com/100x100?text=R1',
      'https://via.placeholder.com/100x100?text=R2'
    ],
    date: '2024-01-15'
  },
  {
    id: 2,
    user: {
      name: '李四',
      avatar: 'https://via.placeholder.com/40x40?text=U2'
    },
    rating: 4,
    content: '手感很好，系统流畅，就是价格有点贵。',
    images: [],
    date: '2024-01-10'
  }
])

// 加入购物车
const addToCart = () => {
  console.log('加入购物车:', {
    productId: product.id,
    color: selectedColor.value,
    quantity: quantity.value
  })
  
  ElMessage.success('商品已成功加入购物车！')
  // 这里会实现加入购物车逻辑
}

// 立即购买
const buyNow = () => {
  console.log('立即购买:', {
    productId: product.id,
    color: selectedColor.value,
    quantity: quantity.value
  })
  // 这里会实现立即购买逻辑
  ElMessage.success('正在前往结算页面...')
}
</script>

<style scoped>
.product-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
}

.image-preview {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  margin-bottom: 10px;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
}

.image-thumbnails {
  display: flex;
  gap: 10px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  cursor: pointer;
  border: 2px solid transparent;
}

.thumbnail.active {
  border-color: #409eff;
}

.product-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
}

.product-price-section {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.price-label {
  font-size: 14px;
  margin-right: 10px;
}

.product-price {
  font-size: 24px;
  color: #ff4444;
  font-weight: bold;
  margin-right: 10px;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
}

.product-sales {
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.divider {
  margin: 0 10px;
}

.product-express {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
}

.express-text {
  font-size: 14px;
}

.delivery-time {
  font-size: 14px;
  color: #ff4444;
}

.product-selection {
  margin-bottom: 30px;
}

.selection-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.label {
  width: 60px;
  font-size: 14px;
  margin-right: 15px;
}

.stock {
  margin-left: 15px;
  font-size: 14px;
  color: #999;
}

.action-buttons {
  margin-bottom: 30px;
}

.action-buttons .el-button {
  width: 150px;
  margin-right: 20px;
}

.store-info {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.store-avatar {
  margin-right: 15px;
}

.store-details {
  flex: 1;
}

.store-name {
  font-weight: bold;
  margin-bottom: 10px;
}

.detail-tabs {
  margin-top: 30px;
}

.product-description {
  padding: 20px;
}

.product-description img {
  max-width: 100%;
  margin: 10px 0;
}

.review-item {
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.review-user {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.username {
  margin: 0 15px;
  font-size: 14px;
}

.review-content {
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.6;
}

.review-images {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.review-image {
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.review-date {
  font-size: 12px;
  color: #999;
}
</style>