<template>
  <div class="cart-page">
    <div class="cart-header wrapper">
      <div class="logo" @click="$router.push('/shopping')">
        <h1><a href="javascript:void(0)">购物商城</a></h1>
      </div>
      <div class="title">购物车</div>
      <div class="actions">
        <el-button type="primary" text @click="$router.push('/shopping')">继续逛逛</el-button>
      </div>
    </div>
// Cart Content
    <div class="cart-content wrapper">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>我的购物车</span>
            <span v-if="cartItems.length">共 {{ totalCount }} 件商品</span>
          </div>
        </template>

        <el-empty v-if="cartItems.length === 0" description="购物车还是空的，去逛逛吧~">
          <el-button type="primary" @click="$router.push('/shopping')">去购物</el-button>
        </el-empty>

        <div v-else>
          <div class="cart-table-header">
            <el-checkbox v-model="checkAll" @change="handleCheckAll">全选</el-checkbox>
            <span class="col-goods">商品信息</span>
            <span class="col-price">单价</span>
            <span class="col-qty">数量</span>
            <span class="col-subtotal">小计</span>
            <span class="col-op">操作</span>
          </div>

          <div
            v-for="item in cartItems"
            :key="item.id"
            class="cart-row"
          >
            <div class="col-check">
              <el-checkbox v-model="item.selected" @change="syncCheckAll" />
            </div>
            <div class="col-goods">
              <el-image :src="item.image" fit="cover" class="goods-img">
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="goods-info">
                <div class="goods-title">{{ item.name }}</div>
                <div class="goods-meta">
                  <span v-if="item.color">{{ item.color }}</span>
                </div>
              </div>
            </div>
            <div class="col-price">¥{{ item.price }}</div>
            <div class="col-qty">
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="item.stock || 99"
                size="small"
                @change="(val) => handleNumberChange(item, val)"
              />
            </div>
            <div class="col-subtotal">¥{{ itemSubtotal(item) }}</div>
            <div class="col-op">
              <el-popconfirm
                title="确定要删除该商品吗？"
                confirm-button-text="删除"
                cancel-button-text="取消"
                @confirm="handleDelete([item])"
              >
                <template #reference>
                  <el-button type="danger" text size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>
      </el-card>

      <div v-if="cartItems.length" class="cart-footer">
        <div class="left">
          <el-checkbox v-model="checkAll" @change="handleCheckAll">全选</el-checkbox>
          <el-button type="danger" text @click="handleBatchDelete" :disabled="!hasChecked">批量删除</el-button>
        </div>
        <div class="right">
          <div class="summary">
            已选 <span class="highlight">{{ checkedCount }}</span> 件商品，合计
            <span class="amount">¥{{ totalAmount }}</span>
          </div>
          <el-button type="primary" size="large" :disabled="!hasChecked" @click="handleCheckout">去结算</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

const router = useRouter()

const cartItems = ref([
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    price: 9999,
    quantity: 1,
    stock: 999,
    image: 'https://via.placeholder.com/100x100?text=iPhone+15',
    color: '钛金属色',
    selected: true
  },
  {
    id: 2,
    name: '华为 Mate60 Pro 512GB',
    price: 6999,
    quantity: 2,
    stock: 500,
    image: 'https://via.placeholder.com/100x100?text=Mate60',
    color: '雅川青',
    selected: false
  },
  {
    id: 3,
    name: '小米 14 Ultra 1TB',
    price: 5999,
    quantity: 1,
    stock: 300,
    image: 'https://via.placeholder.com/100x100?text=Xiaomi+14',
    color: '白兰雪',
    selected: true
  }
])

const checkAll = ref(false)

const hasChecked = computed(() => cartItems.value.some(i => i.selected))
const checkedCount = computed(() => cartItems.value.filter(i => i.selected).length)
const totalCount = computed(() => cartItems.value.reduce((sum, i) => sum + Number(i.quantity || 0), 0))
const totalAmount = computed(() => {
  const sum = cartItems.value
    .filter(i => i.selected)
    .reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0)
  return sum.toFixed(2)
})

const itemSubtotal = (item) => {
  return (Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)
}

const handleCheckAll = (val) => {
  cartItems.value.forEach(i => { i.selected = val })
}

const syncCheckAll = () => {
  checkAll.value = cartItems.value.length > 0 && cartItems.value.every(i => i.selected)
}

const handleNumberChange = (item, val) => {
  const n = Number(val || 1)
  item.quantity = n
}

const handleDelete = (items) => {
  const ids = items.map(i => i.id).filter(Boolean)
  if (!ids.length) {
    ElMessage.warning('无法删除：缺少商品ID')
    return
  }

  try {
    const idSet = new Set(ids)
    cartItems.value = cartItems.value.filter(i => !idSet.has(i.id))
    ElMessage.success('删除成功')
  } catch (e) {
    console.error('删除购物车项失败:', e)
    ElMessage.error('删除失败')
  }
}

const handleBatchDelete = () => {
  const selected = cartItems.value.filter(i => i.selected)
  if (!selected.length) return

  ElMessageBox.confirm(
    `确定要删除选中的 ${selected.length} 件商品吗？`,
    '批量删除',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    handleDelete(selected)
  }).catch(() => {})
}

const handleCheckout = () => {
  if (!hasChecked.value) return
  ElMessage.success('结算成功，已生成订单')
  router.push('/shopping')
}
</script>

<style scoped>
.cart-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 40px 120px;
  box-sizing: border-box;
}

.wrapper {
  width: 100%;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.logo {
  flex-shrink: 0;
  cursor: pointer;
}

.logo a {
  display: block;
  width: 180px;
  height: 40px;
  background-image: none;
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  text-decoration: none;
}

.cart-header .title {
  font-size: 22px;
  font-weight: 600;
}

.cart-content {
  margin-top: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.cart-table-header,
.cart-row {
  display: grid;
  grid-template-columns: 60px minmax(260px, 3fr) 120px 150px 120px 100px;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
}

.cart-table-header {
  background-color: #f5f7fa;
  border-radius: 6px;
  color: #888;
}

.cart-row {
  border-bottom: 1px solid #f2f2f2;
}

.cart-row:last-child {
  border-bottom: none;
}

.col-goods {
  display: flex;
  align-items: center;
}

.goods-img {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  margin-right: 12px;
  background-color: #f5f7fa;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.goods-info {
  flex: 1;
}

.goods-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.goods-meta {
  font-size: 12px;
  color: #999;
}

.goods-meta .tags {
  margin-left: 12px;
}

.col-price,
.col-qty,
.col-subtotal,
.col-op {
  text-align: center;
}

.col-subtotal {
  color: #e1251b;
  font-weight: 600;
}

.cart-footer {
  margin-top: 16px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.cart-footer .summary {
  font-size: 14px;
}

.cart-footer .highlight {
  color: #e1251b;
  font-weight: 600;
  margin: 0 4px;
}

.cart-footer .amount {
  color: #e1251b;
  font-size: 18px;
  font-weight: 700;
  margin-left: 4px;
}

@media (max-width: 1200px) {
  .cart-page {
    padding: 20px;
  }

  .cart-table-header,
  .cart-row {
    grid-template-columns: 40px minmax(200px, 3fr) 100px 140px 100px 80px;
  }
}

@media (max-width: 768px) {
  .cart-page {
    padding: 10px;
  }

  .cart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .cart-table-header,
  .cart-row {
    grid-template-columns: 40px minmax(160px, 2.5fr) 80px 120px 80px 60px;
    padding: 8px 4px;
  }
}
</style>