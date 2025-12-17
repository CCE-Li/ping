<template>
  <div class="min-h-screen bg-gray-50 pb-20 container mx-auto">
    <!-- 页面标题 -->
    <div class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-xl font-bold text-gray-800">消息中心</h1>
      </div>
    </div>
    
    <!-- 消息标签页 -->
    <div class="bg-white mb-4">
      <div class="flex border-b">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="flex-1 py-3 text-center font-medium transition-colors"
          :class="activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-800'"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>
    
    <!-- 消息列表 -->
    <div class="container mx-auto px-4">
      <div v-if="loading" class="bg-white rounded-lg p-6 text-gray-600 text-sm">
        加载中...
      </div>

      <div v-else-if="loadError" class="bg-white rounded-lg p-6">
        <p class="text-sm text-red-600">{{ loadError }}</p>
        <button class="mt-3 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full" @click="fetchMessages">
          重试
        </button>
      </div>

      <!-- 系统消息 -->
      <div v-else-if="activeTab === 'system'" class="space-y-3">
        <div 
          v-for="message in systemMessages" 
          :key="message.id"
          class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div class="flex justify-between items-start">
            <h3 class="font-medium text-gray-800">{{ message.title }}</h3>
            <span class="text-xs text-gray-400">{{ message.time }}</span>
          </div>
          <p class="mt-2 text-sm text-gray-600 line-clamp-2">{{ message.content }}</p>
          <div v-if="!message.isRead" class="mt-2 w-2 h-2 bg-primary rounded-full"></div>
        </div>
      </div>
      
      <!-- 订单消息 -->
      <div v-else-if="activeTab === 'order'" class="space-y-3">
        <div 
          v-for="message in orderMessages" 
          :key="message.id"
          class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div class="flex justify-between items-start">
            <h3 class="font-medium text-gray-800">{{ message.title }}</h3>
            <span class="text-xs text-gray-400">{{ message.time }}</span>
          </div>
          <p class="mt-2 text-sm text-gray-600">{{ message.content }}</p>
          <div v-if="!message.isRead" class="mt-2 w-2 h-2 bg-primary rounded-full"></div>
          <div class="mt-3">
            <button class="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
              查看订单
            </button>
          </div>
        </div>
      </div>
      
      <!-- 活动消息 -->
      <div v-else-if="activeTab === 'promo'" class="space-y-3">
        <div 
          v-for="message in promoMessages" 
          :key="message.id"
          class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div class="flex">
            <div class="flex-1 p-4">
              <div class="flex justify-between items-start">
                <h3 class="font-medium text-gray-800">{{ message.title }}</h3>
                <span class="text-xs text-gray-400">{{ message.time }}</span>
              </div>
              <p class="mt-2 text-sm text-gray-600 line-clamp-2">{{ message.content }}</p>
              <div v-if="!message.isRead" class="mt-2 w-2 h-2 bg-primary rounded-full"></div>
              <div class="mt-3">
                <button class="text-xs text-white bg-primary px-3 py-1 rounded-full">
                  立即查看
                </button>
              </div>
            </div>
            <div class="w-20 h-20">
              <img :src="message.image" alt="活动图片" class="w-full h-full object-cover">
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="messagesEmpty" class="bg-white rounded-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p class="text-gray-500">暂无消息</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import { useUserStore } from '../stores/userStore'
import { messageApi } from '../utils/api'

const activeTab = ref('system')
const userStore = useUserStore()
const loading = ref(false)
const loadError = ref('')

// 标签页数据
const tabs = ref([
  { id: 'system', name: '系统消息' },
  { id: 'order', name: '订单消息' },
  { id: 'promo', name: '活动消息' }
])

const systemMessages = ref([])
const orderMessages = ref([])
const promoMessages = ref([])

const normalizeMessage = (m, fallbackId) => {
  const id = m?.id ?? fallbackId
  const title = m?.title ?? '消息'
  const content = m?.content ?? ''
  const time = m?.createTime ?? m?.time ?? ''
  const isRead = Boolean(m?.isRead)
  return { id, title, content, time, isRead, image: m?.image }
}

const fetchMessages = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const userId = userStore.userInfo?.id || userStore.userInfo?.username || 'guest'
    const payload = await messageApi.getUserMessages(userId)
    const data = payload?.data || {}

    systemMessages.value = Array.isArray(data.system)
      ? data.system.map((m, idx) => normalizeMessage(m, idx + 1))
      : []
    orderMessages.value = Array.isArray(data.order)
      ? data.order.map((m, idx) => normalizeMessage(m, idx + 1))
      : []
    promoMessages.value = Array.isArray(data.promo)
      ? data.promo.map((m, idx) => normalizeMessage(m, idx + 1))
      : []
  } catch (e) {
    loadError.value = e?.message || '获取消息失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMessages()
})

// 判断当前消息列表是否为空
const messagesEmpty = computed(() => {
  if (activeTab.value === 'system') return systemMessages.value.length === 0
  if (activeTab.value === 'order') return orderMessages.value.length === 0
  if (activeTab.value === 'promo') return promoMessages.value.length === 0
  return true
})
</script>