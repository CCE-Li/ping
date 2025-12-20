<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="max-w-3xl mx-auto px-4 py-4">
      <el-card shadow="never">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-base font-medium">我的订单</span>
            <el-button size="small" @click="refresh" :loading="loading">刷新</el-button>
          </div>
        </template>

        <el-tabs v-model="status" class="mb-3" @tab-change="onTabChange">
          <el-tab-pane label="全部" name="" />
          <el-tab-pane label="待付款" name="pending" />
          <el-tab-pane label="待发货" name="shipping" />
          <el-tab-pane label="待收货" name="delivered" />
          <el-tab-pane label="已完成" name="completed" />
        </el-tabs>

        <el-skeleton v-if="loading" :rows="6" animated />

        <el-alert v-else-if="loadError" :title="loadError" type="error" show-icon :closable="false" />

        <div v-else>
          <el-empty v-if="orders.length === 0" description="暂无订单" />

          <div v-else class="space-y-3">
            <el-card v-for="o in orders" :key="o.id" shadow="hover">
              <div class="flex items-start justify-between">
                <div>
                  <div class="text-sm text-gray-500">订单号：{{ o.id }}</div>
                  <div class="mt-1 font-medium text-gray-800">收货人：{{ o.recipient }}（{{ o.phone }}）</div>
                  <div class="mt-1 text-sm text-gray-600">地址：{{ o.address }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-500">状态：{{ formatStatus(o.status) }}</div>
                  <div class="mt-1 text-base font-semibold text-secondary">¥{{ formatAmount(o.total_amount) }}</div>
                </div>
              </div>

              <div class="mt-3">
                <el-divider />
                <div v-for="it in (o.items || [])" :key="it.id" class="flex items-center justify-between py-1">
                  <div class="text-sm text-gray-700">{{ it.product_name }}</div>
                  <div class="text-sm text-gray-500">x{{ it.quantity }}</div>
                  <div class="text-sm text-gray-700">¥{{ formatAmount(it.subtotal) }}</div>
                </div>
              </div>

              <div v-if="o.status === 'pending'" class="mt-3 flex justify-end">
                <el-button size="small" type="primary" :loading="payingId === o.id" @click="openPayDialog(o)">立即付款</el-button>
              </div>
            </el-card>
          </div>
        </div>
      </el-card>

      <el-dialog
        v-model="payDialogVisible"
        title="选择付款方式"
        width="360px"
        :close-on-click-modal="false"
        :close-on-press-escape="!confirmPayLoading"
        :show-close="!confirmPayLoading"
      >
        <div class="space-y-3">
          <el-radio-group v-model="selectedPayMethod" class="flex flex-col gap-2">
            <el-radio label="wechat">微信支付</el-radio>
            <el-radio label="alipay">支付宝</el-radio>
            <el-radio label="bank">银行卡</el-radio>
          </el-radio-group>

          <div v-if="payDialogOrder" class="text-sm text-gray-600">
            订单号：{{ payDialogOrder.id }}
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <el-button :disabled="confirmPayLoading" @click="closePayDialog">取消</el-button>
            <el-button type="primary" :loading="confirmPayLoading" @click="confirmPay">确认付款</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

import { orderApi } from '../utils/api'

const route = useRoute()

const status = ref('')
const orders = ref([])
const loading = ref(false)
const loadError = ref('')
const payingId = ref(null)

const payDialogVisible = ref(false)
const payDialogOrder = ref(null)
const selectedPayMethod = ref('wechat')
const confirmPayLoading = ref(false)

const formatAmount = (v) => {
  const num = Number(v || 0)
  return num.toFixed(2)
}

const formatStatus = (s) => {
  if (s === 'pending') return '待付款'
  if (s === 'shipping') return '待发货'
  if (s === 'delivered') return '待收货'
  if (s === 'completed') return '已完成'
  return s || '全部'
}

const fetchOrders = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const res = await orderApi.getOrders(status.value)
    if (res?.success) {
      orders.value = res.data || []
    } else {
      loadError.value = res?.error || '获取订单失败'
    }
  } catch (e) {
    loadError.value = e?.message || '获取订单失败'
  } finally {
    loading.value = false
  }
}

const refresh = async () => {
  await fetchOrders()
  ElMessage.success('已刷新')
}

const openPayDialog = (order) => {
  if (!order?.id) return
  payDialogOrder.value = order
  selectedPayMethod.value = 'wechat'
  payDialogVisible.value = true
}

const closePayDialog = () => {
  if (confirmPayLoading.value) return
  payDialogVisible.value = false
  payDialogOrder.value = null
}

const confirmPay = async () => {
  const order = payDialogOrder.value
  if (!order?.id) return
  confirmPayLoading.value = true
  payingId.value = order.id
  try {
    const res = await orderApi.payOrder(order.id)
    if (res?.success) {
      if (selectedPayMethod.value === 'wechat') ElMessage.success('已使用微信支付付款成功')
      else if (selectedPayMethod.value === 'alipay') ElMessage.success('已使用支付宝付款成功')
      else ElMessage.success('已使用银行卡付款成功')
      await fetchOrders()
      closePayDialog()
    } else {
      ElMessage.error(res?.error || '付款失败')
    }
  } catch (e) {
    const backendMsg = e?.response?.data?.error
    ElMessage.error(backendMsg || e?.message || '付款失败')
  } finally {
    payingId.value = null
    confirmPayLoading.value = false
  }
}

const onTabChange = async () => {
  await fetchOrders()
}

onMounted(() => {
  const q = route.query?.status
  status.value = typeof q === 'string' ? q : ''
  fetchOrders()
})
</script>
