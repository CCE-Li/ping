<template>
  <div class="register-shell min-h-screen py-12 px-4 sm:px-8">
    <div class="register-layout">
      <div class="register-highlight">
        <div class="register-highlight__badge">CREATE ACCOUNT</div>
        <h2>智能商城账户中心</h2>
        <p>手机号注册后，需要完成实名与人脸验证以保障账户安全。</p>
        <ul>
          <li>手机号作为登录账号</li>
          <li>身份证用于实名校验</li>
          <li>人脸验证通过后才能提交</li>
        </ul>
      </div>

      <el-card class="register-panel" shadow="never">
        <div class="register-panel__header">
          <h3>注册</h3>
          <p>请填写信息并完成实名验证</p>
        </div>

        <el-form :model="formData" @submit.prevent="register" class="register-form">
          <el-form-item label="手机号">
            <el-input
              v-model="formData.username"
              size="large"
              placeholder="请输入 11 位手机号"
              autocomplete="username"
              maxlength="11"
            />
            <div v-if="formData.username && !isPhoneValid(formData.username)" class="register-hint register-hint--danger">
              请输入有效的手机号
            </div>
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="formData.password"
              size="large"
              placeholder="6-20 位，包含数字与字母"
              show-password
              autocomplete="new-password"
              minlength="6"
              maxlength="20"
            />
          </el-form-item>

          <el-form-item label="确认密码">
            <el-input
              v-model="formData.confirmPassword"
              size="large"
              placeholder="请再次输入密码"
              show-password
              autocomplete="new-password"
              minlength="6"
            />
            <div v-if="formData.password !== formData.confirmPassword" class="register-hint register-hint--danger">
              两次输入的密码不一致
            </div>
            <div v-if="formData.password && !isPasswordValid(formData.password)" class="register-hint register-hint--danger">
              密码必须包含数字和字母，长度在6-20位之间
            </div>
          </el-form-item>

          <div class="register-divider">
            <span>实名验证</span>
          </div>

          <el-card class="verify-card" shadow="hover">
            <div class="verify-card__section">
              <div class="verify-card__title">身份证正面</div>
              <input
                type="file"
                id="idCardFront"
                accept="image/*"
                class="hidden"
                @change="handleIdCardFrontUpload"
              >
              <label for="idCardFront" class="verify-upload">
                <span class="verify-upload__name">{{ idCardFrontName || '点击上传身份证正面' }}</span>
                <span class="verify-upload__tip">支持图片格式，建议清晰拍摄</span>
              </label>
              <div v-if="idCardFrontPreview" class="verify-preview">
                <img :src="idCardFrontPreview" alt="身份证正面预览">
              </div>
            </div>

            <div class="verify-card__section">
              <div class="verify-card__title">人脸验证</div>
              <div class="face-card__media">
                <video ref="videoElement" autoplay playsinline></video>
                <canvas ref="faceCanvas"></canvas>
                <div class="face-card__overlay">{{ faceVerifyStatus }}</div>
              </div>
              <div class="face-card__actions">
                <el-button
                  type="success"
                  size="large"
                  :loading="faceVerifying"
                  :disabled="faceVerifying || faceVerified"
                  @click="startFaceVerify"
                >
                  <span v-if="faceVerifying" class="animate-pulse">验证中...</span>
                  <span v-else-if="faceVerified">验证成功</span>
                  <span v-else>开始人脸验证</span>
                </el-button>
                <el-button
                  v-if="faceVerifying"
                  type="danger"
                  size="large"
                  @click="stopFaceVerify"
                >
                  停止验证
                </el-button>
              </div>
            </div>
          </el-card>

          <el-button
            type="primary"
            size="large"
            class="w-full"
            native-type="submit"
            :loading="loading"
            :disabled="loading || formData.password !== formData.confirmPassword || !faceVerified || (formData.password && !isPasswordValid(formData.password)) || (formData.username && !isPhoneValid(formData.username)) || !idCardFront"
          >
            <span v-if="loading" class="animate-pulse">注册中...</span>
            <span v-else>注册</span>
          </el-button>

          <div class="register-footer">
            <span>已有账号？</span>
            <router-link to="/login">立即登录</router-link>
          </div>
        </el-form>
      </el-card>
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
.register-shell {
  background: radial-gradient(circle at top left, #eef2ff, transparent 45%),
    radial-gradient(circle at bottom right, #dbeafe, transparent 40%),
    linear-gradient(135deg, #f8fafc, #eef2ff);
}

.register-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  max-width: 1100px;
  margin: 0 auto;
}

.register-highlight {
  border-radius: 30px;
  padding: 40px;
  background: linear-gradient(135deg, #0ea5e9, #2563eb, #4f46e5);
  color: white;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 30px 60px rgba(37, 99, 235, 0.35);
}

.register-highlight__badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 13px;
  letter-spacing: 2px;
}

.register-highlight h2 {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  margin: 0;
}

.register-highlight p {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.8;
}

.register-highlight ul {
  margin: 12px 0 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
}

.register-highlight li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.register-highlight li::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: white;
  opacity: 0.85;
}

.register-panel {
  border-radius: 32px;
  border: 1px solid rgba(203, 213, 225, 0.6);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

.register-panel__header h3 {
  font-size: 32px;
  margin-bottom: 6px;
  color: #0f172a;
}

.register-panel__header p {
  color: #64748b;
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.register-hint {
  font-size: 13px;
  margin-top: 8px;
}

.register-hint--danger {
  color: #dc2626;
  font-weight: 500;
}

.register-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
  position: relative;
  margin: 6px 0;
}

.register-divider::before,
.register-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.register-divider span {
  padding: 0 12px;
}

.verify-card {
  border-radius: 24px;
  border-color: rgba(226, 232, 240, 0.6);
}

.verify-card__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.verify-card__section + .verify-card__section {
  margin-top: 26px;
}

.verify-card__title {
  font-weight: 600;
  color: #0f172a;
  font-size: 15px;
}

.verify-upload {
  border-radius: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.9);
  background: rgba(248, 250, 252, 0.9);
  padding: 16px 18px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.25s ease;
}

.verify-upload:hover {
  border-color: rgba(37, 99, 235, 0.7);
  background: rgba(239, 246, 255, 0.9);
}

.verify-upload__name {
  font-weight: 600;
  color: #1f2937;
}

.verify-upload__tip {
  font-size: 13px;
  color: #64748b;
}

.verify-preview {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: #0f172a;
}

.verify-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.face-card__media {
  position: relative;
  height: 240px;
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
}

.register-footer {
  text-align: center;
  font-size: 15px;
  color: #475569;
}

.register-footer a {
  color: #2563eb;
  font-weight: 600;
  margin-left: 6px;
  text-decoration: none;
}

.register-footer a:hover {
  color: #1d4ed8;
}

@media (max-width: 860px) {
  .register-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .register-highlight {
    text-align: center;
  }

  .register-highlight__badge {
    align-self: center;
  }

  .register-highlight ul {
    justify-items: center;
  }
}
</style>