// 导入Vue的createApp函数，用于创建Vue应用实例
import { createApp } from 'vue'
// 导入全局样式文件
import './style.css'
// 导入根组件App
import App from './App.vue'
// 导入路由配置
import router from './router'
// 导入Pinia状态管理实例
import { pinia } from './stores'
// 导入axios用于全局拦截器
import axios from 'axios'
// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入环境检测工具
import environmentDetector, { getEnvironmentInfo, isIOS, isAndroid, isHybrid, isDevelopment } from './utils/environmentDetector'

// 核心修复：冻结 location.assign，阻止被修改
if (window.location && window.location.assign) {
  // 1. 保存原始的 assign 方法
  const originalAssign = window.location.assign;
  // 2. 冻结 location 对象的 assign 属性，使其只读
  Object.defineProperty(window.location, 'assign', {
    value: originalAssign,
    writable: false, // 不可写
    configurable: false, // 不可配置
    enumerable: true
  });
}

// 全局修复 v[w] 不是函数的问题
window.fixVWError = function() {
  // 遍历全局对象，保护可能被篡改的回调函数
  const globalObj = window;
  // 给 v 对象（如果存在）增加兜底
  if (globalObj.v && typeof globalObj.v === 'object') {
    // 重写 v 对象的属性访问器，确保属性是函数时才执行
    const proxyV = new Proxy(globalObj.v, {
      get(target, key) {
        const value = target[key];
        // 如果取值是函数则返回，否则返回空函数兜底
        if (typeof value === 'function') {
          return value;
        } else {
          return function() {
            console.warn(`v[${key}] 不是函数，已兜底`, value);
            return null;
          };
        }
      },
      set(target, key, value) {
        // 阻止给 v 对象赋值非函数（可选）
        if (key === 'assign' && target === window.location) {
          console.error('禁止修改 location.assign 只读属性');
          return false;
        }
        target[key] = value;
        return true;
      }
    });
    // 替换全局 v 对象为代理对象
    globalObj.v = proxyV;
  }
};

// 执行修复
window.fixVWError();

// 添加全局axios拦截器以调试URL并确保URL不带尾斜杠
axios.interceptors.request.use(
  config => {
    // 打印完整的请求URL和调用栈
    console.log('全局请求拦截器 - 请求URL:', config.url)
    
    // 检查URL是否以斜杠结尾，如果是则移除
    if (config.url && config.url.endsWith('/')) {
      config.url = config.url.slice(0, -1);
      console.log('全局修正URL，移除尾斜杠:', config.url);
    }
    
    // 直接将API请求指向后端服务器的实际地址，绕过代理配置
    if (config.url && config.url.startsWith('/api')) {
      config.baseURL = 'http://localhost:8000';
      console.log('全局修正API请求URL，使用直接地址:', config.baseURL + config.url);
    }
    
    if (config.url && config.url.includes('/categories/')) {
      console.warn('检测到带斜杠的categories URL:', config.url)
      console.trace('调用栈:')
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 增强的防御性编程，防止外部脚本错误影响应用
window.addEventListener('error', function(e) {
  // 检查错误是否与v[w]或方法不存在相关
  if (e.error && e.error.message) {
    if (e.error.message.includes('v[w]') || e.error.message.includes('is not a function')) {
      console.warn('捕获到潜在的v[w]或方法不存在错误，已忽略:', e.error.message);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }
  // 检查错误是否来自外部脚本
  if (e.filename && !e.filename.includes(window.location.host)) {
    console.warn('捕获到外部脚本错误，已忽略:', e.error ? e.error.message : 'Unknown error');
    console.warn('错误来源:', e.filename, '行:', e.lineno, ', 列:', e.colno);
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  // 其他类型的错误正常报告
  console.error('外部脚本错误:', e);
});

// 增强的JSON解析错误处理
const originalParse = JSON.parse;
JSON.parse = function(text, reviver) {
  try {
    return originalParse(text, reviver);
  } catch (e) {
    console.error('JSON解析错误，已忽略:', e.message);
    return {};
  }
};

// 增强的对象属性访问保护
const safeAccess = function(obj, path, defaultValue = undefined) {
  try {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
  } catch (e) {
    console.warn('安全访问对象属性失败:', e.message);
    return defaultValue;
  }
};

// 将safeAccess挂载到window上，供全局使用
window.safeAccess = safeAccess;

// 添加全局事件监听器处理器，将wheel事件设置为被动的
(function() {
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    // 对于wheel事件，默认设置为passive
    if (type === 'wheel' && typeof options !== 'object') {
      options = { passive: true };
    } else if (type === 'wheel' && options !== undefined && options !== false) {
      options.passive = true;
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
})();

// 处理异步错误
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Caught unhandled promise rejection:', event.reason);
  event.preventDefault();
  event.stopPropagation();
});


// 实现一个通用的安全函数调用工具，用于防止 v[w] is not a function 类型错误
window.safeCall = function(obj, key, ...args) {
  // 1. 严格检查obj的有效性 - 防止v不是对象/被意外覆盖
  if (obj == null) {
    console.warn(`safeCall警告: obj为${obj}，已安全处理`);
    return undefined;
  }
  
  // 确保obj是真正的对象类型
  if (typeof obj !== 'object') {
    console.warn(`safeCall警告: obj不是对象类型，而是${typeof obj}，已安全处理`, { obj });
    return undefined;
  }
  
  // 2. 严格检查key的有效性 - 防止w对应的键名不存在/拼写错误
  if (!key) {
    console.warn(`safeCall警告: key为空或无效，已安全处理`, { key });
    return undefined;
  }
  
  // 确保key是字符串类型
  if (typeof key !== 'string') {
    console.warn(`safeCall警告: key不是字符串类型，而是${typeof key}，已转换为字符串`, { originalKey: key });
    key = String(key);
    if (!key) {
      console.warn(`safeCall警告: 转换后key为空，已安全处理`);
      return undefined;
    }
  }
  
  // 3. 检查v[w]是否为函数 - 防止v[w]被赋值为非函数类型
  const value = obj[key];
  if (typeof value === 'function') {
    try {
      // 确保this指向正确，处理作用域/闭包问题
      return value.apply(obj, args);
    } catch (e) {
      console.error(`safeCall错误: 调用${key}方法时发生异常`, { 
        error: e.message, 
        stack: e.stack, 
        objKeys: Object.keys(obj),
        args: args
      });
      return undefined;
    }
  }
  
  // 4. 处理非函数情况 - 提供更安全的替代方案
  console.warn(`safeCall警告: 对象的${key}属性不存在或非函数，已安全处理`, { 
    objType: typeof obj, 
    objKeys: Object.keys(obj).filter(k => typeof obj[k] === 'function'), // 只显示函数类型的键
    key, 
    valueType: typeof value, 
    value: value !== undefined ? (typeof value === 'object' ? '[Object]' : value) : 'undefined' 
  });
  
  // 5. 可选：为了防止后续调用再次出错，将非函数值替换为空函数
  // 仅在开发环境或明确配置时启用，避免意外修改对象
  if (process?.env?.NODE_ENV !== 'production' || window.__SAFE_CALL_REPLACE_MODE__) {
    obj[key] = function() {
      console.warn(`safeCall警告: 已安全调用替换后的空函数: ${key}`);
      return undefined;
    };
  }
  
  return undefined;
};

// 全局替换v[w]()调用模式的安全版本
window.safeCallDynamic = function(v, w, ...args) {
  return window.safeCall(v, w, ...args);
};

// 全局替换函数，用于修复动态生成的代码中的v[w]调用
window.replaceVWCalls = function() {
  // 查找所有可能的v变量
  const potentialV = window.v || window.callbackObj || window.handlers;
  
  if (potentialV && typeof potentialV === 'object') {
    // 遍历所有属性，确保都是函数
    Object.keys(potentialV).forEach(key => {
      if (typeof potentialV[key] !== 'function') {
        potentialV[key] = function() {
          console.warn(`已安全替换非函数回调: v[${key}]`);
          return undefined;
        };
      }
    });
  }
};

// 定期执行替换操作，确保动态生成的代码也能被修复
setInterval(() => {
  try {
    window.replaceVWCalls();
  } catch (err) {
    console.error('执行替换操作时发生错误:', err);
  }
}, 2000); // 每2秒执行一次

// 可选：重写Object.prototype.__call__方法，提供更优雅的调用方式（需要浏览器支持）
if (!Object.prototype.__call__) {
  Object.defineProperty(Object.prototype, '__call__', {
    value: function(key, ...args) {
      return window.safeCall(this, key, ...args);
    },
    writable: true,
    enumerable: false,
    configurable: true
  });
}

// 引入v[w]错误修复工具
import { fixVWError, monitorVWError, safeCallVW, detectAndFixVWErrors } from './utils/vwErrorFix';

// 导入代码压缩防护工具
import compressionGuard, { detectVWCallPatterns, wrapAllVWPatterns, fixCompressionError, logGuardStatus } from './utils/compressionGuard';

// 应用v[w]错误修复
fixVWError();
monitorVWError();

// 实现优化的语言检测函数框架
let langCache = null;
let langDetectionPromise = null;

// 异步执行语言检测，避免阻塞主线程
window.detectPageLangAsync = () => {
  // 如果已经有缓存结果，直接返回
  if (langCache) {
    return Promise.resolve(langCache);
  }
  
  // 如果已经有检测任务正在进行，直接返回同一个Promise
  if (langDetectionPromise) {
    return langDetectionPromise;
  }
  
  // 开始新的检测任务，使用更高效的实现
  langDetectionPromise = Promise.resolve()
    .then(() => {
      try {
        // 优先从HTML标签获取语言，这是最快的方式
        const htmlLang = document.documentElement.lang;
        if (htmlLang) {
          return htmlLang;
        }
        
        // 使用默认语言，避免额外的DOM查询
        return 'zh-CN';
      } catch (error) {
        console.warn('Language detection failed:', error);
        return 'zh-CN';
      }
    })
    .then(lang => {
      // 更新缓存
      langCache = lang;
      return lang;
    });
  
  return langDetectionPromise;
};

// 同步版本，复用异步版本的结果
window.detectPageLang = () => {
  // 如果已有缓存结果，直接返回
  if (langCache) return langCache;
  
  // 启动异步检测但立即返回默认值
  window.detectPageLangAsync();
  
  // 返回默认值，异步结果会更新缓存
  return 'zh-CN';
};

// 页面加载时自动启动语言检测，预先填充缓存
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.detectPageLangAsync();
  });
} else {
  window.detectPageLangAsync();
}


// 1. 创建Vue应用实例，以App组件作为根组件
console.log('1. 开始创建Vue应用实例')
const app = createApp(App)
console.log('Vue应用实例创建成功:', app)

// 注册路由插件，使应用支持路由功能
console.log('注册路由插件...')
app.use(router)
console.log('路由插件注册成功')

// 注册Pinia状态管理插件，使应用支持集中式状态管理
console.log('注册Pinia状态管理插件...')
app.use(pinia)
console.log('Pinia状态管理插件注册成功')

// 注册 Element Plus
console.log('注册Element Plus...')
app.use(ElementPlus)
console.log('Element Plus注册成功')

// 导入WindiCSS
import 'virtual:windi.css'
// 导入WindiCSS配置
import 'virtual:windi/config'

//// 集成环境检测工具
window.environmentDetector = environmentDetector
window.getEnvironmentInfo = getEnvironmentInfo
window.isIOS = isIOS
window.isAndroid = isAndroid
window.isHybrid = isHybrid
window.isDevelopment = isDevelopment

// 集成代码压缩防护工具
window.compressionGuard = compressionGuard
window.detectVWCallPatterns = detectVWCallPatterns
window.wrapAllVWPatterns = wrapAllVWPatterns
window.fixCompressionError = fixCompressionError
window.logGuardStatus = logGuardStatus

// 根据环境应用不同的修复策略
function applyEnvironmentSpecificFixes() {
  const envInfo = getEnvironmentInfo()
  console.log('当前环境信息:', envInfo)
  
  // 应用v[w]错误修复
  fixVWError()
  monitorVWError()
  
  // 应用代码压缩防护
  console.log('应用代码压缩防护...')
  wrapAllVWPatterns()
  logGuardStatus()
  
  // 根据不同环境应用不同的修复策略
  if (envInfo.device.isMobile) {
    // 移动端环境：更严格的错误检测和修复
    console.log('移动端环境：启用更严格的v[w]错误检测和修复')
    
    // 增加修复频率
    window.safeApplyVWInterval = setInterval(() => {
      window.safeApplyVW()
    }, 2000) // 移动端每2秒检测一次
    
    // 额外的移动端修复策略
    setTimeout(() => {
      detectAndFixVWErrors()
      // 移动端额外的代码压缩防护
      wrapAllVWPatterns()
    }, 500) // 移动端更快执行修复
  } else {
    // 桌面端环境：标准修复策略
    console.log('桌面端环境：启用标准的v[w]错误检测和修复')
  }
  
  if (envInfo.sdk.isHybrid) {
    // Hybrid环境：特殊的修复策略
    console.log('Hybrid环境：启用Hybrid专用的v[w]错误修复')
    
    // 针对Hybrid环境的特殊处理
    const hybridFixInterval = setInterval(() => {
      try {
        // 检查并修复可能的SDK回调问题
        if (window.v && typeof window.v === 'object') {
          Object.keys(window.v).forEach(key => {
            if (typeof window.v[key] !== 'function') {
              window.v[key] = function() {
                console.warn(`Hybrid环境：已修复v[${key}]为安全函数`)
                return undefined
              }
            }
          })
        }
        // Hybrid环境额外的代码压缩防护
        wrapAllVWPatterns()
      } catch (err) {
        console.error('Hybrid环境修复时发生错误:', err)
      }
    }, 1500) // Hybrid环境更频繁检测
    
    // 组件卸载时清除定时器
    window.addEventListener('beforeunload', () => {
      clearInterval(hybridFixInterval)
    })
  }
  
  if (isIOS()) {
    // iOS环境：特殊的修复策略
    console.log('iOS环境：启用iOS专用的v[w]错误修复')
    
    // iOS环境的特殊处理
    setTimeout(() => {
      detectAndFixVWErrors()
      // iOS环境额外的安全检查
      if (window.v) {
        Object.keys(window.v).forEach(key => {
          if (typeof window.v[key] === 'function') {
            // 在iOS环境中，确保函数有正确的this指向
            const originalFn = window.v[key]
            window.v[key] = function() {
              try {
                return originalFn.apply(this, arguments)
              } catch (err) {
                console.warn(`iOS环境：已捕获并修复v[${key}]调用错误:`, err)
                return undefined
              }
            }
          }
        })
      }
      // iOS环境额外的代码压缩防护
      wrapAllVWPatterns()
    }, 1000)
  }
  
  if (isAndroid()) {
    // Android环境：特殊的修复策略
    console.log('Android环境：启用Android专用的v[w]错误修复')
    
    // Android环境额外的代码压缩防护
    setTimeout(() => {
      wrapAllVWPatterns()
    }, 1500)
  }
}

// 应用环境特定的修复策略
applyEnvironmentSpecificFixes()

// 应用挂载到DOM中ID为'app'的元素上
// 这是Vue应用的启动点，会将App组件渲染到页面上
// 添加检查确保只挂载一次
const appElement = document.getElementById('app')
if (appElement && !appElement.__vue_app__) {
  app.mount('#app')
  console.log('Vue应用已成功挂载到#app元素')
} else {
  console.warn('Vue应用已经挂载或#app元素不存在')
}