<template>
  <div class="profile-shell min-h-screen bg-gradient-to-b from-slate-50 via-white to-white pb-24">
    <div class="mx-auto max-w-6xl px-4 py-8 space-y-6">

      <el-page-header
        title="返回"
        content="个人中心"
        @back="goBack"
        class="bg-white/70 backdrop-blur rounded-2xl px-4"
      />

      <!-- 顶部信息区 -->
      <el-card shadow="never" class="hero-card rounded-3xl overflow-hidden border-none">
        <div class="hero-surface rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row gap-6">

          <div class="flex items-center gap-4 flex-1">
            <el-avatar
              v-if="userStore.isLoggedIn"
              :size="80"
              :src="userAvatar"
            />
            <el-avatar v-else :size="80">{{ userStore.username?.charAt(0) || '?' }}</el-avatar>

            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-2xl font-semibold tracking-wide text-gray-900">
                  {{ userStore.isLoggedIn ? displayName : '立即登录体验更多权益' }}
                </span>
                <el-tag size="small" type="success" effect="light" v-if="userStore.isLoggedIn">
                  普通会员
                </el-tag>
              </div>
              <p class="mt-1 text-gray-500 text-sm" v-if="!userStore.isLoggedIn">
                登录后可同步订单、收藏、地址信息
              </p>
              <el-descriptions
                v-else
                :column="1"
                size="small"
                class="mt-3 hero-desc"
              >
                <el-descriptions-item label="用户ID">{{ userId }}</el-descriptions-item>
                <el-descriptions-item label="手机号">{{ userStore.userInfo?.phone || '— —' }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
          <div class="hero-actions">
            <div class="hero-actions__panel">
              <el-button
                v-if="!userStore.isLoggedIn"
                type="primary"
                size="large"
                round
                @click="goToLogin"
              >
                立即登录
              </el-button>
              <el-button
                v-else
                size="large"
                round
                type="primary"
                plain
                @click="openEdit"
              >
                编辑资料
              </el-button>
              <div class="hero-actions__stats">
                <div class="hero-stat">
                  <span class="hero-stat__value">{{ pendingOrders }}</span>
                  <span class="hero-stat__label">待处理</span>
                </div>
                <div class="hero-stat">
                  <span class="hero-stat__value">{{ availableCoupons }}</span>
                  <span class="hero-stat__label">优惠券</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4">
          <el-alert
            v-if="profileError"
            :title="profileError"
            type="error"
            show-icon
            :closable="false"
          />
          <el-skeleton v-else-if="profileLoading" :rows="2" animated />
        </div>
      </el-card>

      <!-- 主体内容 -->
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <el-card shadow="hover" class="rounded-2xl">
            <template #header>
              <div class="flex items-center">
                <span class="text-base font-semibold text-gray-800">订单概览</span>
                <el-button type="text" class="ml-auto" @click="goToOrders('')">
                  查看全部
                  <el-icon class="ml-1"><ArrowRight /></el-icon>
                </el-button>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col
                v-for="(order, index) in orderStatuses"
                :key="index"
                :xs="12"
                :sm="6"
              >
                <div class="order-pill" @click="goToOrders(order.status)">
                  <el-badge :value="order.count" :hidden="order.count === 0">
                    <div class="order-pill__icon">
                      <component :is="order.icon" :size="22" class="text-primary" />
                    </div>
                  </el-badge>
                  <p class="order-pill__label">{{ order.label }}</p>
                </div>
              </el-col>
            </el-row>
          </el-card>

          <el-card shadow="hover" class="rounded-2xl">
            <template #header>
              <span class="text-base font-semibold text-gray-800">常用服务</span>
            </template>
            <el-row :gutter="20">
              <el-col
                v-for="(item, index) in menuItems"
                :key="index"
                :xs="24"
                :sm="12"
              >
                <div class="service-card" @click="item.action && item.action()">
                  <div class="service-card__icon">
                    <component :is="item.icon" :size="20" />
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-800">{{ item.label }}</p>
                    <p v-if="item.description" class="text-xs text-gray-500 mt-1">{{ item.description }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <el-tag v-if="item.badge" size="small" effect="plain" type="danger">{{ item.badge }}</el-tag>
                    <el-icon class="text-gray-300"><ArrowRight /></el-icon>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </div>

        <div class="space-y-6">
          <el-card shadow="hover" class="rounded-2xl">
            <template #header>
              <span class="text-base font-semibold text-gray-800">会员资讯</span>
            </template>
            <ul class="space-y-3 text-sm text-gray-600">
              <li>· 会员等级：<strong class="text-gray-900">普通会员</strong></li>
              <li>· 开通更多权益可享专属折扣、积分翻倍</li>
              <li>· 绑定手机号可保障账号安全，找回密码更便捷</li>
            </ul>
            <el-button type="primary" round plain size="small" class="mt-4 w-full">了解会员计划</el-button>
          </el-card>

          <el-card shadow="hover" class="rounded-2xl">
            <template #header>
              <span class="text-base font-semibold text-gray-800">更多设置</span>
            </template>
            <div class="settings-grid">
              <div
                v-for="(item, index) in otherItems"
                :key="index"
                class="settings-tile"
                @click="item.action && item.action()"
              >
                <div class="settings-tile__icon" :class="item.danger ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'">
                  <component :is="item.icon" :size="20" />
                </div>
                <div class="settings-tile__content" :class="item.danger ? 'text-red-600' : 'text-gray-800'">
                  <span>{{ item.label }}</span>
                </div>
                <el-icon class="text-gray-300"><ArrowRight /></el-icon>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>

  <el-dialog v-model="editVisible" title="编辑资料" width="420px" destroy-on-close>
    <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="90px">
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="editForm.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-input v-model="editForm.avatar" placeholder="请输入头像URL" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="editForm.gender" placeholder="请选择" class="w-full">
          <el-option label="" value="" />
          <el-option label="男" value="male" />
          <el-option label="女" value="female" />
          <el-option label="保密" value="unknown" />
        </el-select>
      </el-form-item>
      <el-form-item label="简介" prop="bio">
        <el-input v-model="editForm.bio" type="textarea" :rows="3" placeholder="一句话介绍自己" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="saveProfile">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { orderApi, userApi } from '../utils/api'
import { ElMessage } from 'element-plus'
import {
  ArrowRight,
  WalletFilled,
  Box,
  Van,
  Finished,
  Location,
  CollectionTag,
  Tickets,
  Shop,
  Setting,
  QuestionFilled,
  SwitchButton
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const profileLoading = ref(false)
const profileError = ref('')

const userId = computed(() => userStore.userInfo?.id || '')
const userAvatar = computed(() => userStore.userInfo?.avatar || 'https://picsum.photos/id/1005/100/100')
const displayName = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.username || '')

const orderCounts = reactive({
  pending: 0,
  shipping: 0,
  delivered: 0,
  completed: 0
})

const pendingOrders = computed(() => orderCounts.pending)
const availableCoupons = 3

const editVisible = ref(false)
const saving = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  nickname: '',
  phone: '',
  avatar: '',
  gender: '',
  bio: ''
})

const editRules = {
  phone: [
    {
      validator: (_rule, value, callback) => {
        if (!value) return callback()
        const ok = /^1[3-9]\d{9}$/.test(String(value))
        if (!ok) return callback(new Error('手机号格式不正确'))
        return callback()
      },
      trigger: 'blur'
    }
  ],
  avatar: [
    {
      validator: (_rule, value, callback) => {
        if (!value) return callback()
        try {
          // eslint-disable-next-line no-new
          new URL(String(value))
          return callback()
        } catch {
          return callback(new Error('头像URL不合法'))
        }
      },
      trigger: 'blur'
    }
  ]
}

const fetchOrderCounts = async () => {
  if (!userStore.isLoggedIn) return
  try {
    const res = await orderApi.getOrders('')
    if (res?.success) {
      const list = res?.data || []
      orderCounts.pending = 0
      orderCounts.shipping = 0
      orderCounts.delivered = 0
      orderCounts.completed = 0

      list.forEach((o) => {
        const s = String(o?.status || '')
        if (s === 'pending') orderCounts.pending += 1
        else if (s === 'shipping') orderCounts.shipping += 1
        else if (s === 'delivered') orderCounts.delivered += 1
        else if (s === 'completed') orderCounts.completed += 1
      })
    }
  } catch {
    orderCounts.pending = 0
    orderCounts.shipping = 0
    orderCounts.delivered = 0
    orderCounts.completed = 0
  }
}

const goBack = () => {
  router.back()
}

const goToLogin = () => {
  router.push('/login')
}

const fetchProfile = async () => {
  if (!userStore.isLoggedIn) return
  profileLoading.value = true
  profileError.value = ''

  try {
    const res = await userApi.getProfile()
    if (res?.success && res?.data) {
      userStore.updateUserInfo(res.data)
    } else {
      profileError.value = res?.error || '获取用户资料失败'
    }
  } catch (e) {
    profileError.value = e?.message || '获取用户资料失败'
  } finally {
    profileLoading.value = false
  }
}

const openEdit = async () => {
  await fetchProfile()
  editForm.nickname = userStore.userInfo?.nickname || ''
  editForm.phone = userStore.userInfo?.phone || ''
  editForm.avatar = userStore.userInfo?.avatar || ''
  editForm.gender = userStore.userInfo?.gender || ''
  editForm.bio = userStore.userInfo?.bio || ''
  editVisible.value = true
}

const saveProfile = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const res = await userApi.updateProfile({
        nickname: editForm.nickname,
        phone: editForm.phone,
        avatar: editForm.avatar,
        gender: editForm.gender,
        bio: editForm.bio
      })
      if (res?.success && res?.data) {
        userStore.updateUserInfo(res.data)
        ElMessage.success('保存成功')
        editVisible.value = false
      } else {
        ElMessage.error(res?.error || '保存失败')
      }
    } catch (e) {
      ElMessage.error(e?.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

onMounted(() => {
  fetchProfile()
  fetchOrderCounts()
})

const goToOrders = (status) => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  router.push({ path: '/orders', query: { status } })
}

const goToAddress = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  alert('跳转到收货地址页面')
}

const goToFavorites = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  alert('跳转到我的收藏页面')
}

const goToCoupons = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  alert('跳转到优惠券页面')
}

const goToSettings = () => {
  alert('跳转到设置页面')
}

const goToHelp = () => {
  alert('跳转到帮助与反馈页面')
}

const openPage1 = () => {
  try {
    const newWindow = window.open('http://localhost:5005/page1', '_blank')
    if (newWindow) {
      newWindow.focus()
    } else {
      alert('打开商家失败，可能是浏览器阻止了弹出窗口')
    }
  } catch (error) {
    console.error('打开商家时出错:', error)
    alert('打开商家时出错，请稍后重试。')
  }
}

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}

const orderStatuses = computed(() => [
  { status: 'pending', label: '待付款', icon: WalletFilled, count: orderCounts.pending },
  { status: 'shipping', label: '待发货', icon: Box, count: orderCounts.shipping },
  { status: 'delivered', label: '待收货', icon: Van, count: orderCounts.delivered },
  { status: 'completed', label: '已完成', icon: Finished, count: orderCounts.completed }
])

const menuItems = reactive([
  { label: '收货地址', icon: Location, description: '管理默认地址', action: goToAddress },
  { label: '我的收藏', icon: CollectionTag, description: '查看喜爱的商品', action: goToFavorites },
  { label: '优惠券', icon: Tickets, badge: `${availableCoupons}张可用`, description: '及时使用优惠', action: goToCoupons }
])

const otherItems = reactive([
  { label: '商家合作', icon: Shop, action: openPage1 },
  { label: '设置', icon: Setting, action: goToSettings },
  { label: '帮助与反馈', icon: QuestionFilled, action: goToHelp },
  { label: '退出登录', icon: SwitchButton, danger: true, action: logout }
])

</script>

<style scoped>
.profile-shell {
  background: radial-gradient(circle at top, rgba(241, 245, 249, 0.6), transparent 65%);
}

.hero-card {
  border: none;
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.08);
}

.hero-surface {
  background: white;
  color: #0f172a;
  border-radius: 32px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.hero-surface .el-tag {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
  color: #065f46;
}

.hero-stat {
  flex: 1;
  min-width: 100px;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  text-align: center;
  color: #111827;
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.hero-stat__value {
  display: block;
  font-size: 26px;
  font-weight: 700;
}

.hero-stat__label {
  font-size: 12px;
  opacity: 0.7;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-width: 260px;
}

.hero-actions__stats {
  display: flex;
  align-items: stretch;
  flex-wrap: nowrap;
  gap: 14px;
}

.order-pill {
  border-radius: 18px;
  padding: 16px 12px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  background: #f8fafc;
}

.order-pill:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
  background: white;
}

.order-pill__icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
}

.order-pill__label {
  font-size: 13px;
  color: #475569;
}

.service-card {
  border-radius: 20px;
  padding: 16px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.2s ease;
}

.service-card:hover {
  background: white;
  box-shadow: 0 12px 24px rgba(148, 163, 184, 0.18);
  transform: translateY(-3px);
}

.service-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(79, 70, 229, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 18px;
}

.settings-tile {
  border-radius: 18px;
  padding: 16px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
}

.settings-tile:hover {
  background: white;
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(148, 163, 184, 0.2);
}

.settings-tile__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.settings-tile__content {
  flex: 1;
  font-weight: 500;
}

.settings-row {
  border-radius: 16px;
  padding: 12px 14px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.settings-row:hover {
  background: white;
  transform: translateX(4px);
  box-shadow: 0 8px 18px rgba(148, 163, 184, 0.15);
}

.settings-row__icon {
  font-size: 20px;
}

@media (max-width: 768px) {
  .hero-gradient {
    padding: 20px;
  }

  .hero-actions__stats {
    flex-wrap: wrap;
  }

  .service-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .service-card__icon {
    margin-bottom: 8px;
  }
}

.compact-order-card span {
  font-size: 11px;
}

.service-item,
.settings-item {
  min-height: 56px;
}

.service-icon,
.settings-icon {
  font-size: 20px;
}

.service-text p:first-child {
  font-size: 13px;
}
</style>