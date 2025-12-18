<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="max-w-3xl mx-auto px-4 py-4">
      <el-card shadow="never">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-base font-medium">消息中心</span>
            <el-button type="primary" size="small" @click="goToService">智能客服</el-button>
          </div>
        </template>

        <el-tabs v-model="activeTab" class="mt-2">
          <el-tab-pane v-for="tab in tabs" :key="tab.id" :label="tab.name" :name="tab.id" />
        </el-tabs>

        <div class="mt-3">
          <el-skeleton v-if="loading" :rows="4" animated />

          <div v-else-if="loadError">
            <el-alert :title="loadError" type="error" show-icon :closable="false" />
            <div class="mt-3">
              <el-button size="small" @click="fetchMessages">重试</el-button>
            </div>
          </div>

          <div v-else>
            <template v-if="activeTab === 'system'">
              <div v-if="systemMessages.length" class="space-y-3">
                <el-card v-for="message in systemMessages" :key="message.id" shadow="hover">
                  <div class="flex items-start justify-between">
                    <div class="min-w-0">
                      <div class="font-medium text-gray-800">{{ message.title }}</div>
                      <div class="mt-2 text-sm text-gray-600">{{ message.content }}</div>
                    </div>
                    <div class="ml-4 text-xs text-gray-400 whitespace-nowrap">{{ message.time }}</div>
                  </div>
                </el-card>
              </div>
              <el-empty v-else description="暂无消息" />
            </template>

            <template v-else-if="activeTab === 'order'">
              <div v-if="orderMessages.length" class="space-y-3">
                <el-card v-for="message in orderMessages" :key="message.id" shadow="hover">
                  <div class="flex items-start justify-between">
                    <div class="min-w-0">
                      <div class="font-medium text-gray-800">{{ message.title }}</div>
                      <div class="mt-2 text-sm text-gray-600">{{ message.content }}</div>
                      <div class="mt-3">
                        <el-button size="small">查看订单</el-button>
                      </div>
                    </div>
                    <div class="ml-4 text-xs text-gray-400 whitespace-nowrap">{{ message.time }}</div>
                  </div>
                </el-card>
              </div>
              <el-empty v-else description="暂无消息" />
            </template>

            <template v-else-if="activeTab === 'promo'">
              <div v-if="promoMessages.length" class="space-y-3">
                <el-card v-for="message in promoMessages" :key="message.id" shadow="hover">
                  <div class="flex items-start justify-between">
                    <div class="min-w-0">
                      <div class="font-medium text-gray-800">{{ message.title }}</div>
                      <div class="mt-2 text-sm text-gray-600">{{ message.content }}</div>
                      <div class="mt-3">
                        <el-button type="primary" size="small">立即查看</el-button>
                      </div>
                    </div>
                    <div class="ml-4 text-xs text-gray-400 whitespace-nowrap">{{ message.time }}</div>
                  </div>
                </el-card>
              </div>
              <el-empty v-else description="暂无消息" />
            </template>

            <el-empty v-else description="暂无消息" />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useUserStore } from '../stores/userStore'
import { messageApi } from '../utils/api'

const activeTab = ref('system')
const router = useRouter()
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

const goToService = () => {
  router.push('/service')
}

// 判断当前消息列表是否为空
const messagesEmpty = computed(() => {
  if (activeTab.value === 'system') return systemMessages.value.length === 0
  if (activeTab.value === 'order') return orderMessages.value.length === 0
  if (activeTab.value === 'promo') return promoMessages.value.length === 0
  return true
})
</script>