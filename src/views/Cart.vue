<template>
  <div class="cart-page min-h-screen bg-gray-50 py-8">
    <div class="wrapper">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">购物车</h1>
        
        <div v-if="cartItems.length > 0">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-3">商品信息</th>
                  <th class="text-center py-3">单价</th>
                  <th class="text-center py-3">数量</th>
                  <th class="text-right py-3">小计</th>
                  <th class="text-center py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="item in cartItems" 
                  :key="item.id"
                  class="border-b hover:bg-gray-50"
                >
                  <td class="py-4">
                    <div class="flex items-center">
                      <div class="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mr-4">
                        <span class="text-gray-400">图片</span>
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-800">{{ item.name }}</h3>
                        <p class="text-sm text-gray-500">{{ item.description }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="text-center py-4">
                    <span class="text-red-500 font-medium">¥{{ item.price }}</span>
                  </td>
                  <td class="text-center py-4">
                    <div class="flex items-center justify-center">
                      <el-button 
                        size="small" 
                        circle 
                        @click="decreaseQuantity(item)"
                      >
                        -
                      </el-button>
                      <span class="mx-3 w-10 text-center">{{ item.quantity }}</span>
                      <el-button 
                        size="small" 
                        circle 
                        @click="increaseQuantity(item)"
                      >
                        +
                      </el-button>
                    </div>
                  </td>
                  <td class="text-right py-4">
                    <span class="text-red-500 font-bold">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
                  </td>
                  <td class="text-center py-4">
                    <el-button 
                      type="danger" 
                      size="small" 
                      plain
                      @click="removeFromCart(item)"
                    >
                      删除
                    </el-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="flex justify-between items-center mt-8 pt-6 border-t">
            <div>
              <el-button @click="clearCart" type="danger" plain>清空购物车</el-button>
            </div>
            <div class="text-right">
              <div class="mb-2">
                总计: <span class="text-2xl font-bold text-red-500">¥{{ totalPrice.toFixed(2) }}</span>
              </div>
              <el-button type="primary" size="large" @click="checkout">去结算</el-button>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12">
          <div class="text-5xl mb-4">🛒</div>
          <h3 class="text-xl font-medium text-gray-700 mb-2">购物车为空</h3>
          <p class="text-gray-500 mb-6">您还没有添加任何商品到购物车</p>
          <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()

const cartItems = computed(() => cartStore.items)
const totalPrice = computed(() => cartStore.totalPrice)

const increaseQuantity = (item) => {
  cartStore.updateQuantity(item.id, item.quantity + 1)
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.id, item.quantity - 1)
  } else {
    removeFromCart(item)
  }
}

const removeFromCart = (item) => {
  ElMessageBox.confirm(
    `确定要从购物车中删除 ${item.name} 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    cartStore.removeFromCart(item.id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户取消删除
  })
}

const clearCart = () => {
  ElMessageBox.confirm(
    '确定要清空购物车吗？',
    '确认清空',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    cartStore.clearCart()
    ElMessage.success('购物车已清空')
  }).catch(() => {
    // 用户取消清空
  })
}

const checkout = () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空，无法结算')
    return
  }
  
  router.push('/checkout')
}
</script>

<style scoped>
.cart-page {
  min-height: calc(100vh - 140px);
}

table th {
  font-weight: 500;
  color: #666;
}
</style>