<template>
  <div class="min-h-screen bg-gray-50 pb-10">
    <div class="max-w-5xl mx-auto px-4 py-4">
      <el-card shadow="never">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-base font-medium">管理后台</span>
              <el-tag v-if="adminToken" type="success">已登录</el-tag>
              <el-tag v-else type="info">未登录</el-tag>
            </div>
            <div class="flex items-center gap-2">
              <el-button v-if="adminToken" size="small" @click="logoutAdmin">退出</el-button>
              <el-button size="small" @click="refreshCurrent" :loading="loading">刷新</el-button>
            </div>
          </div>
        </template>

        <el-alert
          v-if="!adminToken"
          title="请使用管理员账号登录后进行管理操作"
          type="warning"
          show-icon
          :closable="false"
          class="mb-4"
        />

        <div v-if="!adminToken" class="max-w-md">
          <el-form :model="loginForm" label-width="80px">
            <el-form-item label="账号">
              <el-input v-model="loginForm.username" placeholder="管理员账号" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="loginForm.password" type="password" show-password placeholder="管理员密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loginLoading" @click="loginAdmin">登录</el-button>
            </el-form-item>
          </el-form>

          <el-divider />

          <el-alert
            title="首次使用请先初始化管理员（需要后端环境变量 ADMIN_INIT_KEY）"
            type="info"
            show-icon
            :closable="false"
            class="mb-3"
          />

          <el-form :model="initForm" label-width="80px">
            <el-form-item label="InitKey">
              <el-input v-model="initForm.initKey" placeholder="与后端 ADMIN_INIT_KEY 一致" />
            </el-form-item>
            <el-form-item label="账号">
              <el-input v-model="initForm.username" placeholder="要设置为管理员的账号" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="initForm.password" type="password" show-password placeholder="设置/重置密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="warning" plain :loading="initLoading" @click="initAdmin">初始化管理员</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-tabs v-else v-model="activeTab" @tab-change="onTabChange">
          <el-tab-pane label="商品管理" name="products" />
          <el-tab-pane label="订单管理" name="orders" />
        </el-tabs>

        <div v-if="adminToken">
          <el-skeleton v-if="loading" :rows="6" animated />
          <el-alert v-else-if="loadError" :title="loadError" type="error" show-icon :closable="false" />

          <div v-else>
            <div v-if="activeTab === 'products'">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <el-input v-model="productKeyword" placeholder="搜索商品（名称/描述）" clearable style="width: 260px" @keyup.enter="fetchProducts" />
                  <el-button size="small" @click="fetchProducts">搜索</el-button>
                </div>
                <div class="flex items-center gap-2">
                  <el-input v-model="bulkStock" placeholder="批量库存" style="width: 120px" />
                  <el-button size="small" type="warning" plain :loading="bulkStockLoading" @click="resetAllStock">一键设置库存</el-button>
                  <el-button type="primary" size="small" @click="openCreateProduct">新增商品</el-button>
                </div>
              </div>

              <el-table :data="products" stripe border size="small">
                <el-table-column prop="id" label="ID" width="70" />
                <el-table-column prop="name" label="名称" min-width="160" />
                <el-table-column prop="price" label="价格" width="90">
                  <template #default="scope">¥{{ formatAmount(scope.row.price) }}</template>
                </el-table-column>
                <el-table-column prop="stock" label="库存" width="90" />
                <el-table-column prop="category" label="分类" width="120" />
                <el-table-column label="操作" width="200" fixed="right">
                  <template #default="scope">
                    <el-button size="small" @click="openEditProduct(scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" plain @click="deleteProduct(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div class="flex justify-end mt-3">
                <el-pagination
                  layout="prev, pager, next"
                  :page-size="productPageSize"
                  :current-page="productPage"
                  :total="productTotal"
                  @current-change="onProductPageChange"
                />
              </div>
            </div>

            <div v-else-if="activeTab === 'orders'">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <el-select v-model="orderStatus" placeholder="筛选状态" clearable style="width: 180px" @change="fetchOrders">
                    <el-option label="待付款" value="pending" />
                    <el-option label="待发货" value="shipping" />
                    <el-option label="待收货" value="delivered" />
                    <el-option label="已完成" value="completed" />
                  </el-select>
                  <el-input v-model="orderUserId" placeholder="用户ID（可选）" clearable style="width: 180px" @keyup.enter="fetchOrders" />
                  <el-button size="small" @click="fetchOrders">查询</el-button>
                </div>
              </div>

              <el-table :data="orders" stripe border size="small">
                <el-table-column prop="id" label="订单ID" width="90" />
                <el-table-column prop="user_id" label="用户ID" width="90" />
                <el-table-column prop="recipient" label="收货人" width="120" />
                <el-table-column prop="phone" label="电话" width="130" />
                <el-table-column prop="address" label="地址" min-width="180" />
                <el-table-column prop="total_amount" label="金额" width="100">
                  <template #default="scope">¥{{ formatAmount(scope.row.total_amount) }}</template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="110">
                  <template #default="scope">
                    <el-tag>{{ scope.row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="280" fixed="right">
                  <template #default="scope">
                    <el-select v-model="scope.row._newStatus" placeholder="改状态" size="small" style="width: 120px">
                      <el-option label="pending" value="pending" />
                      <el-option label="shipping" value="shipping" />
                      <el-option label="delivered" value="delivered" />
                      <el-option label="completed" value="completed" />
                    </el-select>
                    <el-button size="small" type="primary" plain class="ml-2" @click="updateOrderStatus(scope.row)">保存</el-button>
                    <el-button size="small" type="danger" plain class="ml-2" @click="deleteOrder(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div class="flex justify-end mt-3">
                <el-pagination
                  layout="prev, pager, next"
                  :page-size="orderPageSize"
                  :current-page="orderPage"
                  :total="orderTotal"
                  @current-change="onOrderPageChange"
                />
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="productDialogVisible" :title="productDialogTitle" width="520px">
      <el-form :model="productForm" label-width="90px">
        <el-form-item label="名称">
          <el-input v-model="productForm.name" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model="productForm.price" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input v-model="productForm.stock" />
        </el-form-item>
        <el-form-item label="分类ID">
          <el-input v-model="productForm.category_id" placeholder="可为空" />
        </el-form-item>
        <el-form-item label="图片URL">
          <el-input v-model="productForm.image" placeholder="可为空" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="productForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="productSaving" @click="saveProduct">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

import { adminApi } from '../utils/api'

const activeTab = ref('products')

const adminToken = ref(localStorage.getItem('adminToken') || '')
const loginForm = reactive({ username: '', password: '' })
const loginLoading = ref(false)

const initForm = reactive({ initKey: '', username: '', password: '' })
const initLoading = ref(false)

const loading = ref(false)
const loadError = ref('')

const formatAmount = (v) => {
  const num = Number(v || 0)
  return num.toFixed(2)
}

const initAdmin = async () => {
  if (!initForm.initKey || !initForm.username || !initForm.password) {
    ElMessage.error('请填写 InitKey/账号/密码')
    return
  }

  initLoading.value = true
  try {
    const res = await adminApi.initAdmin({
      initKey: initForm.initKey,
      username: initForm.username,
      password: initForm.password
    })
    if (res?.success) {
      ElMessage.success('管理员初始化成功，请使用账号密码登录')
      loginForm.username = initForm.username
      loginForm.password = initForm.password
    } else {
      ElMessage.error(res?.error || '初始化失败')
    }
  } catch (e) {
    const backendMsg = e?.response?.data?.error
    ElMessage.error(backendMsg || e?.message || '初始化失败')
  } finally {
    initLoading.value = false
  }
}

const resetAllStock = async () => {
  const v = Number(bulkStock.value)
  if (!Number.isFinite(v) || v < 0) {
    ElMessage.error('库存必须是 >= 0 的数字')
    return
  }

  if (!confirm(`确定将所有商品库存统一设置为 ${v} 吗？`)) return

  bulkStockLoading.value = true
  try {
    const res = await adminApi.resetProductsStock(v)
    if (res?.success) {
      ElMessage.success(`已将所有商品库存设置为 ${res.stock}`)
      await fetchProducts()
    } else {
      ElMessage.error(res?.error || '批量设置失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '批量设置失败')
  } finally {
    bulkStockLoading.value = false
  }
}

const setAdminToken = (token) => {
  adminToken.value = token || ''
  if (token) localStorage.setItem('adminToken', token)
  else localStorage.removeItem('adminToken')
}

const loginAdmin = async () => {
  loginLoading.value = true
  try {
    const res = await adminApi.login({
      username: loginForm.username,
      password: loginForm.password
    })
    if (res?.success && res?.token) {
      setAdminToken(res.token)
      ElMessage.success('登录成功')
      await refreshCurrent()
    } else {
      ElMessage.error(res?.error || '登录失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '登录失败')
  } finally {
    loginLoading.value = false
  }
}

const logoutAdmin = () => {
  setAdminToken('')
  products.value = []
  orders.value = []
  ElMessage.success('已退出')
}

const onTabChange = async () => {
  await refreshCurrent()
}

const refreshCurrent = async () => {
  if (!adminToken.value) return
  if (activeTab.value === 'products') await fetchProducts()
  if (activeTab.value === 'orders') await fetchOrders()
}

// -------- 商品管理 --------
const products = ref([])
const productKeyword = ref('')
const productPage = ref(1)
const productPageSize = ref(20)
const productTotal = ref(0)

const bulkStock = ref('100')
const bulkStockLoading = ref(false)

const fetchProducts = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const res = await adminApi.listProducts({
      page: productPage.value,
      per_page: productPageSize.value,
      keyword: productKeyword.value
    })
    if (res?.success) {
      products.value = res.results || []
      productTotal.value = res.count || 0
    } else {
      loadError.value = res?.error || '获取商品失败'
    }
  } catch (e) {
    loadError.value = e?.message || '获取商品失败'
  } finally {
    loading.value = false
  }
}

const onProductPageChange = async (p) => {
  productPage.value = p
  await fetchProducts()
}

const productDialogVisible = ref(false)
const productDialogTitle = ref('')
const productSaving = ref(false)
const productForm = reactive({
  id: null,
  name: '',
  price: '',
  stock: '',
  category_id: '',
  image: '',
  description: ''
})

const resetProductForm = () => {
  productForm.id = null
  productForm.name = ''
  productForm.price = ''
  productForm.stock = ''
  productForm.category_id = ''
  productForm.image = ''
  productForm.description = ''
}

const openCreateProduct = () => {
  resetProductForm()
  productDialogTitle.value = '新增商品'
  productDialogVisible.value = true
}

const openEditProduct = (row) => {
  productForm.id = row.id
  productForm.name = row.name || ''
  productForm.price = String(row.price ?? '')
  productForm.stock = String(row.stock ?? '')
  productForm.category_id = row.category_id == null ? '' : String(row.category_id)
  productForm.image = row.image || ''
  productForm.description = row.description || ''
  productDialogTitle.value = `编辑商品 #${row.id}`
  productDialogVisible.value = true
}

const saveProduct = async () => {
  if (!productForm.name) {
    ElMessage.error('商品名称必填')
    return
  }

  productSaving.value = true
  try {
    const payload = {
      name: productForm.name,
      price: productForm.price === '' ? 0 : Number(productForm.price),
      stock: productForm.stock === '' ? 0 : Number(productForm.stock),
      category_id: productForm.category_id === '' ? null : Number(productForm.category_id),
      image: productForm.image || null,
      description: productForm.description || null
    }

    let res
    if (productForm.id) {
      res = await adminApi.updateProduct(productForm.id, payload)
    } else {
      res = await adminApi.createProduct(payload)
    }

    if (res?.success) {
      ElMessage.success('保存成功')
      productDialogVisible.value = false
      await fetchProducts()
    } else {
      ElMessage.error(res?.error || '保存失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    productSaving.value = false
  }
}

const deleteProduct = async (row) => {
  if (!confirm(`确定删除商品 #${row.id} 吗？`)) return
  try {
    const res = await adminApi.deleteProduct(row.id)
    if (res?.success) {
      ElMessage.success('删除成功')
      await fetchProducts()
    } else {
      ElMessage.error(res?.error || '删除失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  }
}

// -------- 订单管理 --------
const orders = ref([])
const orderStatus = ref('')
const orderUserId = ref('')
const orderPage = ref(1)
const orderPageSize = ref(20)
const orderTotal = ref(0)

const fetchOrders = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const res = await adminApi.listOrders({
      page: orderPage.value,
      per_page: orderPageSize.value,
      status: orderStatus.value,
      user_id: orderUserId.value === '' ? undefined : Number(orderUserId.value)
    })
    if (res?.success) {
      orders.value = (res.results || []).map(o => ({ ...o, _newStatus: o.status }))
      orderTotal.value = res.count || 0
    } else {
      loadError.value = res?.error || '获取订单失败'
    }
  } catch (e) {
    loadError.value = e?.message || '获取订单失败'
  } finally {
    loading.value = false
  }
}

const onOrderPageChange = async (p) => {
  orderPage.value = p
  await fetchOrders()
}

const updateOrderStatus = async (row) => {
  const nextStatus = (row._newStatus || '').trim()
  if (!nextStatus) {
    ElMessage.error('请选择状态')
    return
  }
  try {
    const res = await adminApi.updateOrder(row.id, { status: nextStatus })
    if (res?.success) {
      ElMessage.success('更新成功')
      await fetchOrders()
    } else {
      ElMessage.error(res?.error || '更新失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '更新失败')
  }
}

const deleteOrder = async (row) => {
  if (!confirm(`确定删除订单 #${row.id} 吗？`)) return
  try {
    const res = await adminApi.deleteOrder(row.id)
    if (res?.success) {
      ElMessage.success('删除成功')
      await fetchOrders()
    } else {
      ElMessage.error(res?.error || '删除失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  }
}
</script>
