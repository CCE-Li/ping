<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-12 bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div class="px-16 py-16">
        <div class="text-center mb-16">
          <h2 class="text-5xl font-bold text-gray-900">用户注册</h2>
          <p class="mt-6 text-xl text-gray-600">创建您的账号，开启全新体验</p>
        </div>
        
        <form @submit.prevent="register" class="mt-8 space-y-8">
          <div class="space-y-6">
            <div>
              <label for="username" class="block text-xl font-medium text-gray-700 mb-3">
                账号
              </label>
              <input 
                id="username" 
                v-model="formData.username" 
                type="text" 
                class="block w-full px-6 py-6 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xl"
                placeholder="请输入手机号"
                required
                maxlength="11"
                minlength="11"
                pattern="^1[3-9]\d{9}$"
              >
              <div v-if="formData.username && !isPhoneValid(formData.username)" class="mt-3 text-red-500 text-xl font-medium">
              请输入有效的手机号
            </div>
            </div>
            
            <div>
              <label for="password" class="block text-xl font-medium text-gray-700 mb-3">
                密码
              </label>
              <input 
                id="password" 
                v-model="formData.password" 
                type="password" 
                class="block w-full px-6 py-6 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xl"
                placeholder="请设置密码（6-20位，包含数字和字母）"
                required
                minlength="6"
                maxlength="20"
              >
            </div>
            
            <div>
              <label for="confirmPassword" class="block text-xl font-medium text-gray-700 mb-3">
                确认密码
              </label>
              <input 
                id="confirmPassword" 
                v-model="formData.confirmPassword" 
                type="password" 
                class="block w-full px-6 py-6 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xl"
                placeholder="请再次输入密码"
                required
                minlength="6"
              >
            </div>
          </div>
          
          <!-- 身份证正面上传 -->
          <div class="mt-8">
            <label class="block text-xl font-medium text-gray-700 mb-5">
              身份证正面
            </label>
            <div class="border border-gray-200 rounded-2xl p-8 bg-gray-50">
              <input 
                type="file" 
                id="idCardFront" 
                accept="image/*" 
                class="hidden" 
                @change="handleIdCardFrontUpload"
              >
              <label 
                for="idCardFront" 
                class="block text-center cursor-pointer px-8 py-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 mb-5 font-medium text-xl"
              >
                {{ idCardFrontName || '上传身份证正面' }}
              </label>
              
              <div v-if="idCardFrontPreview" class="mt-5">
                <img :src="idCardFrontPreview" alt="身份证正面预览" class="max-w-full h-auto rounded-xl shadow-sm border border-gray-100">
              </div>
            </div>
          </div>
          
          <!-- 新增人脸验证部分 -->
          <div class="mt-8">
            <label class="block text-xl font-medium text-gray-700 mb-5">
              人脸验证
            </label>
            <div class="border border-gray-200 rounded-2xl p-8 bg-gray-50">
              <div class="relative w-full h-72 bg-white rounded-xl shadow-sm mb-8 overflow-hidden border border-gray-100">
                <!-- 摄像头视频流 -->
                <video 
                  ref="videoElement" 
                  class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  autoplay 
                  playsinline
                ></video>
                <!-- 人脸捕捉画布 -->
                <canvas 
                  ref="faceCanvas" 
                  class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                ></canvas>
                <!-- 状态显示 -->
                <div v-if="!faceVerifying && !faceVerified" class="w-full h-full flex items-center justify-center bg-gray-50 text-gray-600 text-xl">
                  {{ faceVerifyStatus }}
                </div>
                <div v-else class="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 text-white font-medium text-3xl backdrop-blur-sm">
                  {{ faceVerifyStatus }}
                </div>
              </div>
              <div class="flex gap-6 justify-center">
                <button 
                  type="button" 
                  class="px-10 py-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium text-xl"
                  @click="startFaceVerify"
                  :disabled="faceVerifying || faceVerified"
                >
                  <span v-if="faceVerifying" class="animate-pulse">验证中...</span>
                  <span v-else-if="faceVerified">验证成功</span>
                  <span v-else>开始人脸验证</span>
                </button>
                <button 
                  v-if="faceVerifying" 
                  type="button" 
                  class="px-10 py-5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium text-xl"
                  @click="stopFaceVerify"
                >
                  停止验证
                </button>
              </div>
            </div>
          </div>
          
          <div class="space-y-4 mt-6">
            <div v-if="formData.password !== formData.confirmPassword" class="text-red-500 text-xl font-medium">
              两次输入的密码不一致
            </div>
            
            <div v-if="formData.password && !isPasswordValid(formData.password)" class="text-red-500 text-xl font-medium">
              密码必须包含数字和字母，长度在6-20位之间
            </div>
          </div>
          
          <div>
            <button 
              type="submit" 
              class="btn-primary w-full py-6 px-4 rounded-xl text-xl font-medium" 
              :disabled="loading || formData.password !== formData.confirmPassword || !faceVerified || (formData.password && !isPasswordValid(formData.password)) || (formData.username && !isPhoneValid(formData.username)) || !idCardFront"
            >
              <span v-if="loading" class="animate-pulse">注册中...</span>
              <span v-else>注册</span>
            </button>
          </div>
          
          <div class="text-center mt-12">
            <p class="text-xl text-gray-600">
              已有账号？
              <router-link to="/login" class="text-blue-600 font-medium hover:text-blue-500 ml-3 transition-colors duration-200">
                立即登录
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
import { userApi } from '../utils/api'

const router = useRouter()

const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

// 身份证上传相关状态
const idCardFront = ref(null)
const idCardFrontPreview = ref('')
const idCardFrontName = ref('')

const loading = ref(false)

// 新增人脸验证相关状态
const faceCanvas = ref(null)
const videoElement = ref(null)
const faceVerifying = ref(false)
const faceVerified = ref(false)
const faceVerifyStatus = ref('请点击按钮开始人脸验证')
const capturedFaceImage = ref(null)

// 摄像头相关变量
let stream = null

// 身份证正面上传处理函数
const handleIdCardFrontUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 验证文件大小（示例：最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('文件大小不能超过5MB')
      return
    }
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }
    
    // 设置文件和预览
    idCardFront.value = file
    idCardFrontName.value = file.name
    
    // 创建预览URL
    const reader = new FileReader()
    reader.onload = (e) => {
      idCardFrontPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 密码验证函数
const isPasswordValid = (password) => {
  // 正则表达式：6-20位，包含数字和字母
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z]).{6,20}$/
  return passwordRegex.test(password)
}

// 手机号验证函数
const isPhoneValid = (phone) => {
  // 正则表达式：中国大陆手机号
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 开始人脸验证 - 访问摄像头
const startFaceVerify = async () => {
  // 检查是否已上传身份证
  if (!idCardFront.value) {
    alert('请先上传身份证正面照片')
    return
  }
  
  faceVerifying.value = true
  faceVerifyStatus.value = '正在调用摄像头...'
  
  try {
    // 1. 获取摄像头权限
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      } 
    })
    
    // 2. 显示视频流
    const video = videoElement.value
    const canvas = faceCanvas.value
    
    if (video && stream) {
      video.srcObject = stream
      video.style.display = 'block'
      
      // 3. 等待视频加载完成
      await new Promise(resolve => {
        video.onloadedmetadata = () => {
          resolve()
        }
      })
      
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
    // 5秒后自动捕捉人脸
    setTimeout(async () => {
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
        
        faceVerifyStatus.value = '正在比对人脸与身份证信息...'
        
        // 6. 模拟人脸比对过程（实际项目中应调用后端API）
        const matchResult = await compareFaceWithIDCard()
        
        if (matchResult) {
          faceVerifyStatus.value = '人脸验证成功！'
          faceVerified.value = true
        } else {
          faceVerifyStatus.value = '人脸与身份证信息不匹配，请重试'
          await stopFaceVerify()
        }
        
        resolve()
      } catch (error) {
        console.error('人脸捕捉失败', error)
        faceVerifyStatus.value = '人脸捕捉失败，请重试'
        await stopFaceVerify()
        resolve()
      }
    }, 5000)
  })
}

// 人脸与身份证比对函数
const compareFaceWithIDCard = async () => {
  // 模拟人脸比对过程（实际项目中应调用后端API）
  // 这里简单模拟比对成功，实际项目中需要将捕捉的人脸图像和身份证照片发送到后端进行比对
  return new Promise((resolve) => {
    setTimeout(() => {
      // 随机模拟比对结果（80%成功率）
      const isMatch = Math.random() > 0.2
      resolve(isMatch)
    }, 2000)
  })
}

// 停止人脸验证
const stopFaceVerify = async () => {
  try {
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
    faceVerifyStatus.value = '请点击按钮开始人脸验证'
  } catch (error) {
    console.error('停止摄像头失败', error)
  }
}

const register = async () => {
  // 1. 验证手机号格式
  if (!isPhoneValid(formData.value.username)) {
    alert('请输入有效的手机号')
    return
  }
  
  // 2. 验证密码是否一致
  if (formData.value.password !== formData.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  
  // 3. 验证密码格式
  if (!isPasswordValid(formData.value.password)) {
    alert('密码必须包含数字和字母，长度在6-20位之间')
    return
  }
  
  // 4. 检查人脸验证状态
  if (!faceVerified.value) {
    alert('请先完成人脸验证')
    return
  }
  
  // 5. 检查身份证是否上传
  if (!idCardFront.value) {
    alert('请上传身份证正面')
    return
  }
  
  loading.value = true
  try {
    if (!formData.value.username || !formData.value.password) {
      alert('请填写完整的注册信息')
      return
    }

    const resp = await userApi.register({
      username: formData.value.username,
      password: formData.value.password
    })

    if (!resp?.success) {
      alert(resp?.error || '注册失败，请稍后重试')
      return
    }

    alert('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    console.error('注册失败', error)
    if (error?.response?.status === 409) {
      alert('用户名已存在')
      return
    }
    alert('注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 辅助函数：将dataURL转换为Blob对象
const dataURLToBlob = (dataURL) => {
  const parts = dataURL.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length
  const uInt8Array = new Uint8Array(rawLength)
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }
  
  return new Blob([uInt8Array], { type: contentType })
}
</script>

<style scoped>
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
/* 全局样式 - 注册页面隐藏导航栏 */
:global(.bottom-nav) {
  display: none !important;
}

:global(header.bg-white.shadow-sm) {
  display: none !important;
}

</style>