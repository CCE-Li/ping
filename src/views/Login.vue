<template>
  <div class="login-shell min-h-screen py-12 px-4 sm:px-8">
    <div class="login-layout">
      <div class="login-highlight">
        <div class="login-highlight__badge">WELCOME BACK</div>
        <h2>智能商城账户中心</h2>
        <p>一次登录，畅享所有频道 · 同步购物车、订单与收藏。</p>
        <ul>
          <li>实时订单追踪</li>
          <li>积分权益同步</li>
          <li>人脸快捷验证</li>
        </ul>
      </div>
      <el-card class="login-panel" shadow="never">
        <div class="login-panel__header">
          <h3>登录</h3>
          <p>输入账户信息以继续</p>
        </div>
        <el-form :model="formData" @submit.prevent="login" class="login-form">
          <el-form-item label="账号">
            <el-input
              v-model="formData.username"
              size="large"
              placeholder="请输入手机号"
              autocomplete="username"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="formData.password"
              size="large"
              placeholder="请输入密码"
              show-password
              autocomplete="current-password"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-button
            type="primary"
            size="large"
            class="w-full"
            native-type="submit"
            :loading="loading"
            :disabled="loading || faceVerifying"
          >
            <span v-if="loading" class="animate-pulse">登录中...</span>
            <span v-else>登录</span>
          </el-button>
          <div class="login-divider">
            <span>或使用快捷方式</span>
          </div>
          <el-card class="face-card" shadow="hover">
            <div class="face-card__media">
              <video ref="videoElement" autoplay playsinline muted></video>
              <canvas ref="faceCanvas"></canvas>
              <div class="face-card__overlay">{{ faceVerifyStatus }}</div>
            </div>
            <div class="face-card__actions">
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
          </el-card>
          <div class="login-footer">
            <span>还没有账号？</span>
            <router-link to="/register">立即注册</router-link>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { userApi } from '../utils/api'
import { User, Lock } from '@element-plus/icons-vue'

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
.login-shell {
  background: radial-gradient(circle at top left, #eef2ff, transparent 45%),
    radial-gradient(circle at bottom right, #dbeafe, transparent 40%),
    linear-gradient(135deg, #f8fafc, #eef2ff);
}

.login-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  max-width: 1100px;
  margin: 0 auto;
}

.login-highlight {
  border-radius: 30px;
  padding: 40px;
  color: #0f172a;
  background: linear-gradient(135deg, #0ea5e9, #2563eb, #4f46e5);
  color: white;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 30px 60px rgba(37, 99, 235, 0.35);
}

.login-highlight__badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 13px;
  letter-spacing: 2px;
}

.login-highlight h2 {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  margin: 0;
}

.login-highlight p {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.8;
}

.login-highlight ul {
  margin: 12px 0 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
}

.login-highlight li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.login-highlight li::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: white;
  opacity: 0.85;
}

.login-panel {
  border-radius: 32px;
  border: 1px solid rgba(203, 213, 225, 0.6);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

.login-panel__header h3 {
  font-size: 32px;
  margin-bottom: 6px;
  color: #0f172a;
}

.login-panel__header p {
  color: #64748b;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
  position: relative;
  margin: 12px 0;
}

.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.login-divider span {
  padding: 0 12px;
}

.face-card {
  border-radius: 24px;
  border-color: rgba(226, 232, 240, 0.6);
}

.face-card__media {
  position: relative;
  height: 260px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.6);
  background: #0f172a;
}

.face-card__media video,
.face-card__media canvas {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: none;
}

.face-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 16px;
  background: rgba(15, 23, 42, 0.45);
  text-align: center;
  padding: 0 12px;
}

.face-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.login-footer {
  text-align: center;
  font-size: 15px;
  color: #475569;
}

.login-footer a {
  color: #2563eb;
  font-weight: 600;
  margin-left: 6px;
  text-decoration: none;
}

.login-footer a:hover {
  color: #1d4ed8;
}

@media (max-width: 860px) {
  .login-layout {
    grid-template-columns: 1fr;
  }

  .login-highlight {
    text-align: center;
  }

  .login-highlight__badge {
    align-self: center;
  }

  .login-highlight ul {
    justify-items: center;
  }

  .login-layout {
    gap: 24px;
  }
}
</style>
