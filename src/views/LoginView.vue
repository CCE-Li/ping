<template>
  <div class="login-container">
    <!-- 左侧2/3区域：品牌宣传 -->
    <div class="left-panel">
      <div class="brand-content">
        <h1 class="brand-title">易购商城</h1>
        <p class="brand-slogan">品质生活，触手可及</p>
        <p class="brand-description">为您提供最优质的商品和最便捷的购物体验</p>
        <p class="brand-description">正品保证 · 快速配送 · 贴心服务</p>
      </div>
    </div>
    
    <!-- 右侧1/3区域：登录表单 -->
    <div class="right-panel">
      <div class="login-box">
        <div class="login-header">
          <h2>用户登录</h2>
        </div>
        
        <el-form 
          ref="loginFormRef" 
          :model="loginForm" 
          :rules="loginRules" 
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入用户名/手机号" 
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码" 
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              class="login-button" 
              @click="handleLogin"
              :loading="loading"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="login-footer">
          <div class="forgot-password">
            <a href="#" @click.prevent="handleForgotPassword">忘记密码?</a>
          </div>
          <div class="register-link">
            还没有账号？<a href="#" @click.prevent="goToRegister">立即注册</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref()

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 记住我
const rememberMe = ref(false)

// 加载状态
const loading = ref(false)

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名/手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 模拟登录请求
      setTimeout(() => {
        loading.value = false
        
        // 模拟登录成功
        ElMessage.success('登录成功')
        // 登录成功后跳转到购物主页
        router.push('/shopping')
      }, 1500)
    }
  })
}

// 忘记密码
const handleForgotPassword = () => {
  console.log('跳转到忘记密码页面')
  // 这里可以跳转到忘记密码页面
}

// 去注册页面
const goToRegister = () => {
  console.log('跳转到注册页面')
  // 这里可以跳转到注册页面
}
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.left-panel {
  flex: 2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.brand-content {
  color: white;
  text-align: center;
  max-width: 600px;
}

.brand-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-slogan {
  font-size: 1.8rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.brand-description {
  font-size: 1.2rem;
  margin-bottom: 15px;
  opacity: 0.8;
}

.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 350px;
  padding: 40px 30px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.login-form {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}

.login-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.forgot-password a,
.register-link a {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password a:hover,
.register-link a:hover {
  color: #66b1ff;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .left-panel {
    padding: 40px 20px;
  }
  
  .right-panel {
    padding: 40px 20px;
  }
  
  .brand-title {
    font-size: 2.5rem;
  }
  
  .brand-slogan {
    font-size: 1.3rem;
  }
  
  .brand-description {
    font-size: 1rem;
  }
}
</style>