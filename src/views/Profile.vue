<template>
  <div class="min-h-screen bg-gray-50 pb-20 container mx-auto max-w-md">
    <!-- 页面标题 -->
    <div class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-xl font-bold text-gray-800">个人中心</h1>
      </div>
    </div>
    
    <!-- 用户信息卡片 -->
    <div class="container mx-auto px-4 py-4">
      <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="p-6 flex items-center">
          <el-avatar
            v-if="userStore.isLoggedIn"
            :size="64"
            :src="userAvatar"
          />
          <el-avatar v-else :size="64">{{ userStore.username?.charAt(0) || '?' }}</el-avatar>
          <div class="ml-4 flex-1">
            <h2 class="text-lg font-bold text-gray-800">
              {{ userStore.isLoggedIn ? displayName : '请登录' }}
            </h2>
            <p v-if="!userStore.isLoggedIn" class="text-sm text-gray-500">登录后享受更多服务</p>
            <p v-else class="text-sm text-gray-500">普通会员 | ID: {{ userId }}</p>
          </div>
          <button v-if="!userStore.isLoggedIn" class="bg-primary text-white px-4 py-2 rounded-full text-sm" @click="goToLogin">
            立即登录
          </button>
          <el-button v-else type="primary" plain size="small" @click="openEdit">
            编辑资料
          </el-button>
        </div>

        <div v-if="userStore.isLoggedIn" class="px-6 pb-6">
          <el-alert
            v-if="profileError"
            :title="profileError"
            type="error"
            show-icon
            :closable="false"
          />
          <el-skeleton v-else-if="profileLoading" :rows="2" animated />
        </div>
      </div>
      
      <!-- 订单状态 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="p-4 border-b">
          <h3 class="font-medium text-gray-800">我的订单</h3>
        </div>
        <div class="grid grid-cols-4 py-4">
          <div class="flex flex-col items-center p-2" @click="goToOrders('pending')">
            <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-1">
              <span class="text-sm font-bold text-gray-700">1</span>
            </div>
            <span class="text-xs text-gray-700">待付款</span>
            <span v-if="pendingOrders > 0" class="mt-1 w-4 h-4 bg-secondary text-white rounded-full text-xs flex items-center justify-center">
              {{ pendingOrders }}
            </span>
          </div>
          <div class="flex flex-col items-center p-2" @click="goToOrders('shipping')">
            <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-1">
              <span class="text-sm font-bold text-gray-700">2</span>
            </div>
            <span class="text-xs text-gray-700">待发货</span>
          </div>
          <div class="flex flex-col items-center p-2" @click="goToOrders('delivered')">
            <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-1">
              <span class="text-sm font-bold text-gray-700">3</span>
            </div>
            <span class="text-xs text-gray-700">待收货</span>
          </div>
          <div class="flex flex-col items-center p-2" @click="goToOrders('reviewed')">
            <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-1">
              <span class="text-sm font-bold text-gray-700">4</span>
            </div>
            <span class="text-xs text-gray-700">待评价</span>
          </div>
        </div>
      </div>
      
      <!-- 功能菜单 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="border-b">
          <div class="flex items-center p-3 border-b last:border-b-0" @click="goToAddress">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">📍</span>
            </div>
            <span class="ml-3 flex-1 text-gray-700">收货地址</span>
            <span class="text-sm font-bold text-gray-400">›</span>
          </div>
          <div class="flex items-center p-3 border-b last:border-b-0" @click="goToFavorites">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">❤️</span>
            </div>
            <span class="ml-3 flex-1 text-gray-700">我的收藏</span>
            <span class="text-sm font-bold text-gray-400">›</span>
          </div>
          <div class="flex items-center p-3 border-b last:border-b-0" @click="goToCoupons">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">🎫</span>
            </div>
            <span class="ml-3 flex-1 text-gray-700">优惠券</span>
            <div class="flex items-center">
              <span class="text-xs text-secondary mr-2">{{ availableCoupons }}张可用</span>
              <span class="text-sm font-bold text-gray-400">›</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 其他设置 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="border-b">
          <div class="flex items-center p-3 border-b last:border-b-0" @click="openPage1">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">📄</span>
            </div>
            <span class="ml-3 flex-1 text-gray-700">商家</span>
            <span class="text-sm font-bold text-gray-400">›</span>
          </div>
          <div class="flex items-center p-3 border-b last:border-b-0" @click="goToSettings">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">⚙️</span>
            </div>
            <span class="ml-3 flex-1 text-gray-700">设置</span>
            <span class="text-sm font-bold text-gray-400">›</span>
          </div>
          <div class="flex items-center p-3 border-b last:border-b-0" @click="goToHelp">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">❓</span>
            </div>
            <span class="ml-3 flex-1 text-gray-700">帮助与反馈</span>
            <span class="text-sm font-bold text-gray-400">›</span>
          </div>
          <div v-if="userStore.isLoggedIn" class="flex items-center p-3" @click="logout">
            <div class="w-8 h-8 flex items-center justify-center text-gray-700">
              <span class="text-sm font-bold text-gray-700">🚪</span>
            </div>
            <span class="ml-3 text-red-500">退出登录</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <el-dialog v-model="editVisible" title="编辑资料" width="420px">
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
import { userApi } from '../utils/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const profileLoading = ref(false)
const profileError = ref('')

const userId = computed(() => userStore.userInfo?.id || '')
const userAvatar = computed(() => userStore.userInfo?.avatar || 'https://picsum.photos/id/1005/100/100')
const displayName = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.username || '')

const pendingOrders = 2
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

// 跳转方法
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

// 打开商家
const openPage1 = () => {
  try {
    const newWindow = window.open('http://localhost:5005/page1', '_blank');
    if (newWindow) {
      // 窗口成功打开
      newWindow.focus();
    } else {
      // 窗口可能被浏览器阻止了
        alert('打开商家失败，可能是因为浏览器阻止了弹出窗口。请检查浏览器的弹出窗口设置。');
    }
  } catch (error) {
    console.error('打开商家时出错:', error);
      alert('打开商家时出错，请稍后重试。');
  }
}

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}
</script>