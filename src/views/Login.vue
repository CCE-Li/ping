<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 login-page">
    <div class="max-w-md w-full space-y-12 bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div class="px-6 sm:px-12 lg:px-14 py-12 sm:py-14">
        <div class="text-center mb-16">
          <h2 class="text-5xl font-bold text-gray-900">用户登录</h2>
          <p class="mt-6 text-xl text-gray-600">欢迎回来，请登录您的账号</p>
        </div>
        
        <form @submit.prevent="login" class="login-form mt-8 space-y-8 max-w-sm mx-auto">
          <div class="space-y-6">
            <div>
              <label for="username" class="block text-xl font-medium text-gray-700 mb-3">
                账号
              </label>
              <div class="input-wrap">
                <span class="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <input
                  id="username"
                  v-model="formData.username"
                  type="text"
                  autocomplete="username"
                  class="input-field block w-full pl-12 pr-4 py-4 rounded-xl text-lg"
                  placeholder="请输入手机号"
                  required
                >
              </div>
            </div>
            
            <div>
              <label for="password" class="block text-xl font-medium text-gray-700 mb-3">
                密码
              </label>
              <div class="input-wrap">
                <span class="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 11H7a4 4 0 0 0-4 4v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a4 4 0 0 0-4-4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <input
                  id="password"
                  v-model="formData.password"
                  type="password"
                  autocomplete="current-password"
                  class="input-field block w-full pl-12 pr-4 py-4 rounded-xl text-lg"
                  placeholder="请输入密码"
                  required
                  minlength="6"
                  maxlength="20"
                >
              </div>
            </div>
          </div>
          
          <div>
            <el-button
              native-type="submit"
              type="primary"
              size="large"
              class="w-full"
              :loading="loading"
              :disabled="loading || faceVerifying"
            >
              <span v-if="loading" class="animate-pulse">登录中...</span>
              <span v-else>登录</span>
            </el-button>
          </div>
          
          <!-- 分割线 -->
          <div class="relative my-12">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-xl">
              <span class="px-6 bg-white text-gray-500">或</span>
            </div>
          </div>
          
          <!-- 人脸快捷登录 -->
          <div class="mt-12">
            <div class="border border-gray-200 rounded-2xl p-8 bg-gray-50">
              <div class="relative w-full h-72 bg-white rounded-xl shadow-sm mb-8 overflow-hidden border border-gray-100">
                <!-- 摄像头视频流 -->
                <video 
                  ref="videoElement" 
                  class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  autoplay 
                  playsinline 
                  muted
                ></video>
                <!-- 人脸捕捉画布 -->
                <canvas 
                  ref="faceCanvas" 
                  class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                ></canvas>
                <!-- 状态显示（始终叠加在视频/画布之上） -->
                <div class="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 text-white font-medium text-3xl backdrop-blur-sm">
                  {{ faceVerifyStatus }}
                </div>
              </div>
              <div class="flex gap-6 justify-center">
                <el-button
                  type="success"
                  size="large"
                  :loading="faceVerifying"
                  :disabled="faceVerifying || loading"
                  @click="startFaceLogin"
                >
                  <span v-if="faceVerifying" class="animate-pulse">验证中...</span>
                  <span v-else>人脸快捷登录</span>
                </el-button>
                <el-button
                  v-if="faceVerifying"
                  type="danger"
                  size="large"
                  @click="stopFaceLogin"
                >
                  停止验证
                </el-button>
              </div>
            </div>
          </div>
          
          <div class="text-center mt-12">
            <p class="text-xl text-gray-600">
              还没有账号？
              <router-link to="/register" class="text-blue-600 font-medium hover:text-blue-500 ml-3 transition-colors duration-200">
                立即注册
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { userApi } from '../utils/api'

const router = useRouter()
const userStore = useUserStore()

const formData = ref({
  username: '',
  password: ''
})

const loading = ref(false)

// 人脸验证相关状态
const faceCanvas = ref(null)
const videoElement = ref(null)
const faceVerifying = ref(false)
const faceVerifyStatus = ref('请点击按钮开始人脸快捷登录')
const capturedFaceImage = ref(null)

// 摄像头相关变量
let stream = null
let captureTimeout = null

// 页面加载时初始化视频和画布为隐藏状态
onMounted(() => {
  if (videoElement.value) {
    videoElement.value.style.display = 'none'
  }
  if (faceCanvas.value) {
    faceCanvas.value.style.display = 'none'
  }
})

const login = async () => {
  loading.value = true
  try {
    if (!formData.value.username || !formData.value.password) {
      alert('请输入用户名和密码')
      return
    }

    const resp = await userApi.login({
      username: formData.value.username,
      password: formData.value.password
    })

    if (!resp?.success) {
      alert(resp?.error || '登录失败，请检查用户名和密码')
      return
    }

    userStore.login(resp.user, resp.token)

    const redirect = localStorage.getItem('redirectUrl') || '/'
    localStorage.removeItem('redirectUrl')
    router.push(redirect)
  } catch (error) {
    console.error('登录失败', error)
    alert('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

// 开始人脸快捷登录
const startFaceLogin = async () => {
  faceVerifying.value = true
  faceVerifyStatus.value = '正在调用摄像头...'
  
  try {
    // 1. 获取摄像头权限
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 320 },  // 降低分辨率以提高性能
        height: { ideal: 240 },
        frameRate: { ideal: 15 } // 降低帧率以提高性能
      } 
    })
    
    // 2. 显示视频流
    const video = videoElement.value
    const canvas = faceCanvas.value
    
    if (video && stream) {
      // 隐藏画布，显示视频
      canvas.style.display = 'none'
      video.style.display = 'block'
      
      // 设置视频源
      video.srcObject = stream
      
      // 3. 等待视频加载完成（添加5秒超时）
      const loaded = await Promise.race([
        new Promise(resolve => video.onloadedmetadata = () => resolve(true)),
        new Promise(resolve => setTimeout(() => resolve(false), 5000))
      ])
      
      if (!loaded) {
        throw new Error('视频加载超时')
      }
      
      faceVerifyStatus.value = '请正对摄像头，保持面部清晰...'
      
      // 4. 启动人脸捕捉倒计时
      await captureFace(video, canvas)
    }
  } catch (error) {
    console.error('摄像头访问失败', error)
    faceVerifyStatus.value = '摄像头访问失败，请检查权限设置'
    faceVerifying.value = false
  }
}

// 人脸捕捉函数
const captureFace = async (video, canvas) => {
  return new Promise(async (resolve) => {
    // 2秒后自动捕捉人脸（减少等待时间）
    captureTimeout = setTimeout(async () => {
      try {
        // 设置画布尺寸与视频一致
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // 绘制视频帧到画布
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // 隐藏视频，显示捕捉的图像
        video.style.display = 'none'
        canvas.style.display = 'block'
        
        // 保存捕捉的人脸图像
        capturedFaceImage.value = canvas.toDataURL('image/jpeg', 0.9)
        
        faceVerifyStatus.value = '正在验证人脸信息...'
        
        // 5. 模拟人脸验证过程（实际项目中应调用后端API）
        const matchedUser = await verifyFace()
        
        if (matchedUser) {
          faceVerifyStatus.value = '人脸验证成功！正在登录...'
          
          // 使用匹配到的用户信息进行登录
          const mockUser = {
            id: 1,
            username: matchedUser.username,
            email: `${matchedUser.username}@example.com`
          }
          const mockToken = 'mock-jwt-token-face-' + Date.now()
          
          userStore.login(mockUser, mockToken)
          
          // 登录成功后跳转到首页或上一个页面
          const redirect = localStorage.getItem('redirectUrl') || '/' 
          localStorage.removeItem('redirectUrl')
          router.push(redirect)
        } else {
          faceVerifyStatus.value = '人脸验证失败，未找到匹配的用户信息'
          await stopFaceLogin()
        }
        
        resolve()
      } catch (error) {
        console.error('人脸捕捉失败', error)
        faceVerifyStatus.value = '人脸捕捉失败，请重试'
        await stopFaceLogin()
        resolve()
      }
    }, 2000)
  })
}

// 人脸验证函数
const verifyFace = async () => {
  // 从localStorage读取已注册用户信息
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 检查捕获的人脸图像是否与任何已注册用户的人脸图像匹配
      const matchedUser = registeredUsers.find(user => 
        user.faceImage === capturedFaceImage.value
      )
      
      // 如果匹配，返回对应的用户信息
      resolve(matchedUser || null)
    }, 2000)
  })
}

// 组件卸载时清理资源
onUnmounted(() => {
  stopFaceLogin()
})

// 停止人脸验证
const stopFaceLogin = async () => {
  try {
    // 清除人脸捕捉定时器
    if (captureTimeout) {
      clearTimeout(captureTimeout)
      captureTimeout = null
    }
    
    // 关闭摄像头
    if (stream) {
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      stream = null
    }
    
    // 隐藏视频和画布
    const video = videoElement.value
    const canvas = faceCanvas.value
    
    if (video) {
      video.style.display = 'none'
    }
    if (canvas) {
      canvas.style.display = 'none'
    }
    
    faceVerifying.value = false
    faceVerifyStatus.value = '请点击按钮开始人脸快捷登录'
  } catch (error) {
    console.error('停止摄像头失败', error)
  }
}
</script>
<style scoped>
.login-form {
  width: 100%;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
}

.input-wrap {
  position: relative;
}

.input-icon {
  pointer-events: none;
  position: absolute;
  inset-block: 0;
  left: 0;
  padding-left: 1rem;
  display: flex;
  align-items: center;
  color: rgba(107, 114, 128, 0.9);
}

.input-field {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(209, 213, 219, 0.9);
  color: rgba(17, 24, 39, 0.92);
  outline: none;
  transition: all 0.18s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.input-field::placeholder {
  color: rgba(107, 114, 128, 0.85);
}

.input-field:hover:not(:disabled) {
  border-color: rgba(156, 163, 175, 0.95);
  box-shadow: 0 2px 10px rgba(79, 70, 229, 0.06);
}

.input-field:focus {
  border-color: rgba(79, 70, 229, 0.55);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.18);
}

.input-wrap:focus-within .input-icon {
  color: rgba(79, 70, 229, 0.9);
}

.input-field:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.input-field:-webkit-autofill,
.input-field:-webkit-autofill:hover,
.input-field:-webkit-autofill:focus {
  -webkit-text-fill-color: rgba(17, 24, 39, 0.92);
  transition: background-color 9999s ease-out 0s;
  box-shadow: 0 0 0 9999px rgba(255, 255, 255, 0.96) inset;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background-color: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-green {
  background-color: #10b981;
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.btn-green:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.btn-green:active:not(:disabled) {
  transform: translateY(0);
}

.btn-green:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-red {
  background-color: #ef4444;
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.btn-red:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.btn-red:active:not(:disabled) {
  transform: translateY(0);
}

.text-primary {
  color: #4f46e5;
}
/* 全局样式 - 登录页面隐藏导航栏 */
:global(.bottom-nav) {
  display: none !important;
}

:global(header.bg-white.shadow-sm) {
  display: none !important;
}

</style>
