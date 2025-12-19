<template>
  <div class="profile-page min-h-screen bg-gray-50 py-8">
    <div class="wrapper">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">个人中心</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- 侧边栏 -->
          <div class="lg:col-span-1">
            <div class="bg-gray-50 rounded-lg p-6 text-center">
              <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-primary text-2xl">👤</span>
              </div>
              <h2 class="text-lg font-medium text-gray-800">用户名</h2>
              <p class="text-gray-500 text-sm mt-1">普通会员</p>
              
              <div class="mt-6 space-y-2">
                <button 
                  v-for="item in menuItems" 
                  :key="item.key"
                  class="w-full text-left px-4 py-2 rounded-md transition-colors"
                  :class="activeMenu === item.key ? 'bg-primary text-white' : 'hover:bg-gray-100'"
                  @click="activeMenu = item.key"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- 主内容区 -->
          <div class="lg:col-span-3">
            <div class="bg-gray-50 rounded-lg p-6">
              <!-- 个人信息 -->
              <div v-if="activeMenu === 'info'" class="space-y-6">
                <h3 class="text-lg font-medium text-gray-800">个人信息</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">用户名</label>
                    <div class="form-input bg-white">用户名</div>
                  </div>
                  
                  <div>
                    <label class="form-label">手机号</label>
                    <div class="form-input bg-white">138****8888</div>
                  </div>
                  
                  <div>
                    <label class="form-label">邮箱</label>
                    <div class="form-input bg-white">user@example.com</div>
                  </div>
                  
                  <div>
                    <label class="form-label">注册时间</label>
                    <div class="form-input bg-white">2023-01-01</div>
                  </div>
                </div>
                
                <div class="pt-4">
                  <el-button type="primary">编辑信息</el-button>
                </div>
              </div>
              
              <!-- 订单管理 -->
              <div v-if="activeMenu === 'orders'" class="space-y-6">
                <h3 class="text-lg font-medium text-gray-800">我的订单</h3>
                
                <div v-if="orders.length > 0" class="space-y-4">
                  <div 
                    v-for="order in orders" 
                    :key="order.id"
                    class="bg-white rounded-lg p-4 shadow-sm"
                  >
                    <div class="flex justify-between items-center mb-3">
                      <span class="font-medium">订单号: {{ order.id }}</span>
                      <el-tag :type="getOrderStatusType(order.status)">
                        {{ order.status }}
                      </el-tag>
                    </div>
                    
                    <div class="flex items-center mb-3">
                      <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                        <span class="text-gray-400">图片</span>
                      </div>
                      <div class="flex-1">
                        <h4 class="font-medium">{{ order.productName }}</h4>
                        <p class="text-sm text-gray-500">数量: {{ order.quantity }}</p>
                      </div>
                      <div class="text-right">
                        <div class="font-medium">¥{{ order.total }}</div>
                      </div>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                      <el-button size="small" plain>查看详情</el-button>
                      <el-button 
                        v-if="order.status === '待付款'" 
                        type="primary" 
                        size="small"
                      >
                        立即付款
                      </el-button>
                    </div>
                  </div>
                </div>
                
                <div v-else class="text-center py-8">
                  <div class="text-4xl mb-3">📦</div>
                  <p class="text-gray-500">暂无订单</p>
                </div>
              </div>
              
              <!-- 收货地址 -->
              <div v-if="activeMenu === 'addresses'" class="space-y-6">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-medium text-gray-800">收货地址</h3>
                  <el-button type="primary">新增地址</el-button>
                </div>
                
                <div v-if="addresses.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    v-for="address in addresses" 
                    :key="address.id"
                    class="bg-white rounded-lg p-4 shadow-sm border"
                    :class="{ 'border-primary': address.isDefault }"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-medium">{{ address.name }}</h4>
                      <el-tag v-if="address.isDefault" type="success" size="small">默认</el-tag>
                    </div>
                    <p class="text-gray-600 text-sm mb-1">{{ address.phone }}</p>
                    <p class="text-gray-600 text-sm">{{ address.fullAddress }}</p>
                    <div class="flex justify-end space-x-2 mt-3">
                      <el-button size="small" plain>编辑</el-button>
                      <el-button size="small" type="danger" plain>删除</el-button>
                    </div>
                  </div>
                </div>
                
                <div v-else class="text-center py-8">
                  <div class="text-4xl mb-3">📍</div>
                  <p class="text-gray-500">暂无收货地址</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const activeMenu = ref('info')

const menuItems = [
  { key: 'info', label: '个人信息' },
  { key: 'orders', label: '我的订单' },
  { key: 'addresses', label: '收货地址' },
  { key: 'settings', label: '账户设置' }
]

// 模拟订单数据
const orders = ref([
  { id: '20230601001', productName: '智能手机', quantity: 1, total: '2999.00', status: '待付款' },
  { id: '20230528001', productName: '无线耳机', quantity: 2, total: '798.00', status: '已发货' },
  { id: '20230520001', productName: '智能手表', quantity: 1, total: '1299.00', status: '已完成' }
])

// 模拟地址数据
const addresses = ref([
  { 
    id: 1, 
    name: '张三', 
    phone: '138****8888', 
    fullAddress: '北京市朝阳区某某街道某某小区1号楼101室',
    isDefault: true
  },
  { 
    id: 2, 
    name: '李四', 
    phone: '139****9999', 
    fullAddress: '上海市浦东新区某某路某某大厦201室',
    isDefault: false
  }
])

const getOrderStatusType = (status) => {
  switch (status) {
    case '待付款': return 'warning'
    case '已发货': return 'primary'
    case '已完成': return 'success'
    case '已取消': return 'info'
    default: return 'info'
  }
}

onMounted(() => {
  console.log('Profile page mounted')
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 140px);
}

.form-input.bg-white {
  background-color: #fff;
}
</style>