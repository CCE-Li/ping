<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { DynamicFrameManager } from '../utils/DynamicFrameManager';

// 创建动态标签管理器实例
const frameManager = new DynamicFrameManager();
const loading = ref(false);
const result = ref(null);
const error = ref(null);

// 在组件挂载时初始化
onMounted(() => {
  console.log('DynamicFrameExample组件已挂载');
  // 可以在这里预注册一些回调函数或初始化动态标签
});

// 在组件卸载时清理资源
onBeforeUnmount(() => {
  console.log('DynamicFrameExample组件即将卸载，正在清理资源');
  frameManager.cleanup();
});

// 测试创建动态iframe
const testIframe = async () => {
  try {
    loading.value = true;
    error.value = null;
    result.value = null;
    
    // 注册回调函数
    const callback = (data) => {
      console.log('iframe回调数据:', data);
      result.value = data;
      loading.value = false;
    };
    
    const callbackKey = frameManager.registerCallback(callback);
    
    if (!callbackKey) {
      throw new Error('回调注册失败');
    }
    
    // 创建iframe的URL
    // 注意：这里使用的是示例URL，实际项目中需要替换为真实的SDK或API地址
    const sdkUrl = 'https://example.com/sdk?callback=' + callbackKey;
    
    // 创建动态iframe
    const iframe = frameManager.createIframe(sdkUrl, {
      autoRemove: true, // 自动移除iframe
      removeDelay: 5000, // 5秒后移除
      onload: (e, data) => {
        console.log('iframe加载完成:', e);
        if (!result.value && data) {
          result.value = data;
        }
      }
    });
    
    if (!iframe) {
      throw new Error('iframe创建失败');
    }
    
    console.log('动态iframe创建成功:', iframe);
    
  } catch (err) {
    console.error('测试iframe时发生错误:', err);
    error.value = err.message;
    loading.value = false;
  }
};

// 测试创建动态script
const testScript = async () => {
  try {
    loading.value = true;
    error.value = null;
    result.value = null;
    
    // 注册回调函数
    const callback = (e) => {
      console.log('script回调数据:', e);
      result.value = { message: 'Script加载成功', event: e.type };
      loading.value = false;
    };
    
    const callbackKey = frameManager.registerCallback(callback);
    
    if (!callbackKey) {
      throw new Error('回调注册失败');
    }
    
    // 创建script的URL
    // 注意：这里使用的是示例URL，实际项目中需要替换为真实的SDK或API地址
    const scriptUrl = 'https://example.com/api.js?callback=' + callbackKey;
    
    // 创建动态script
    const script = frameManager.createScript(scriptUrl, {
      autoRemove: true, // 自动移除script
      removeDelay: 3000, // 3秒后移除
      onload: (e) => {
        console.log('script加载完成:', e);
      }
    });
    
    if (!script) {
      throw new Error('script创建失败');
    }
    
    console.log('动态script创建成功:', script);
    
  } catch (err) {
    console.error('测试script时发生错误:', err);
    error.value = err.message;
    loading.value = false;
  }
};

// 清理所有资源
const cleanupResources = () => {
  frameManager.cleanup();
  result.value = null;
  error.value = null;
  loading.value = false;
  console.log('已手动清理所有资源');
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">动态标签管理示例</h1>
    
    <div class="space-y-6">
      <!-- 测试按钮 -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button 
          @click="testIframe" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          :disabled="loading"
        >
          {{ loading ? '加载中...' : '测试动态iframe' }}
        </button>
        
        <button 
          @click="testScript" 
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          :disabled="loading"
        >
          {{ loading ? '加载中...' : '测试动态script' }}
        </button>
        
        <button 
          @click="cleanupResources" 
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          清理资源
        </button>
      </div>
      
      <!-- 结果显示 -->
      <div v-if="result" class="p-4 bg-green-50 border border-green-200 rounded-md">
        <h2 class="font-semibold text-green-800 mb-2">回调结果:</h2>
        <pre class="text-sm text-green-700 overflow-auto max-h-60">{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
      
      <!-- 错误显示 -->
      <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-md">
        <h2 class="font-semibold text-red-800 mb-2">错误信息:</h2>
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>
      
      <!-- 状态显示 -->
      <div v-if="loading" class="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 class="font-semibold text-yellow-800 mb-2">加载中...</h2>
        <p class="text-sm text-yellow-700">正在等待动态标签的响应...</p>
      </div>
      
      <!-- 说明信息 -->
      <div class="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 class="font-semibold text-blue-800 mb-2">使用说明:</h2>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>• 点击"测试动态iframe"按钮将创建一个动态iframe标签</li>
          <li>• 点击"测试动态script"按钮将创建一个动态script标签</li>
          <li>• 所有动态标签都会在指定时间后自动移除</li>
          <li>• 组件卸载时会自动清理所有资源</li>
          <li>• 可以通过"清理资源"按钮手动清理所有资源</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
pre {
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>