<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-6">购物车</h1>
    
    <div v-if="cartStore.isEmpty" class="text-center py-16">
      <p class="text-gray-500 mb-4">您的购物车还是空的</p>
      <router-link to="/" class="btn-primary inline-block">
        去购物
      </router-link>
    </div>
    
    <div v-else>
      <div class="overflow-x-auto mb-6">
        <table class="min-w-full bg-white">
          <thead>
            <tr class="border-b">
              <th class="py-3 px-4 text-left">商品信息</th>
              <th class="py-3 px-4 text-center">单价</th>
              <th class="py-3 px-4 text-center">数量</th>
              <th class="py-3 px-4 text-center">小计</th>
              <th class="py-3 px-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cartStore.items" :key="item.id" class="border-b">
              <td class="py-4 px-4">
                <div class="flex items-center">
                  <img :src="item.image" alt="商品图片" class="w-8 h-8 object-cover mr-4">
                  <div>
                    <h3 class="font-medium line-clamp-2">{{ item.name }}</h3>
                    <p class="text-gray-500 text-sm line-clamp-1">{{ item.description }}</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4 text-center">{{ formatPrice(item.price) }}</td>
              <td class="py-4 px-4 text-center">
                <div class="flex items-center justify-center">
                  <button 
                    class="w-8 h-8 border border-gray-300 rounded-l-md flex items-center justify-center" 
                    @click="updateQuantity(item.id, item.quantity - 1)"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    :value="item.quantity" 
                    class="w-12 h-8 border-t border-b border-gray-300 text-center" 
                    @change="handleQuantityChange(item.id, $event.target.value)"
                    min="1"
                  >
                  <button 
                    class="w-8 h-8 border border-gray-300 rounded-r-md flex items-center justify-center" 
                    @click="updateQuantity(item.id, item.quantity + 1)"
                  >
                    +
                  </button>
                </div>
              </td>
              <td class="py-4 px-4 text-center font-medium">{{ formatPrice(item.price * item.quantity) }}</td>
              <td class="py-4 px-4 text-center">
                <button class="text-red-500 hover:text-red-700" @click="removeFromCart(item.id)">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="flex flex-col md:flex-row justify-end items-end gap-4">
        <button class="btn-secondary" @click="clearCart">
          清空购物车
        </button>
        <div class="bg-gray-50 p-6 rounded-lg min-w-[300px]">
          <div class="flex justify-between mb-2">
            <span>商品总价：</span>
            <span class="font-medium">{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span>运费：</span>
            <span>¥0.00</span>
          </div>
          <div class="flex justify-between text-xl font-bold mt-4 mb-6">
            <span>合计：</span>
            <span class="text-secondary">{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          <router-link to="/checkout" class="btn-primary w-full text-center block">
            去结算
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cartStore'
import { formatPrice } from '../utils/productDataUtils'

const cartStore = useCartStore()

// 更新商品数量
const updateQuantity = (productId, newQuantity) => {
  if (newQuantity > 0) {
    cartStore.updateQuantity(productId, newQuantity)
  }
}

// 处理数量输入框变化
const handleQuantityChange = (productId, value) => {
  const newQuantity = parseInt(value)
  if (!isNaN(newQuantity) && newQuantity > 0) {
    cartStore.updateQuantity(productId, newQuantity)
  }
}

// 从购物车移除商品
const removeFromCart = (productId) => {
  if (confirm('确定要删除这个商品吗？')) {
    cartStore.removeFromCart(productId)
  }
}

// 清空购物车
const clearCart = () => {
  if (confirm('确定要清空购物车吗？')) {
    cartStore.clearCart()
  }
}
</script>