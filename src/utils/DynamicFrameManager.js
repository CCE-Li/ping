// 动态标签（iframe/script）管理器
// 用于在Vue组件生命周期中正确管理动态创建的标签和回调函数

export class DynamicFrameManager {
  constructor() {
    this.callbacks = {}; // 存储回调函数
    this.dynamicElements = []; // 存储创建的动态元素
    this.timers = []; // 存储定时器
    this.componentUnmounted = false; // 组件卸载状态
  }

  /**
   * 注册回调函数
   * @param {Function} callback - 回调函数
   * @returns {string} 回调函数的唯一标识
   */
  registerCallback(callback) {
    if (this.componentUnmounted) {
      console.warn('组件已卸载，不再注册新回调');
      return null;
    }

    const callbackKey = 'callback_' + new Date().getTime() + '_' + Math.random().toString(36).substr(2, 9);
    this.callbacks[callbackKey] = callback;
    return callbackKey;
  }

  /**
   * 创建动态iframe标签
   * @param {string} src - iframe的src属性
   * @param {Object} options - 配置选项
   * @returns {HTMLIFrameElement} 创建的iframe元素
   */
  createIframe(src, options = {}) {
    if (this.componentUnmounted) {
      console.warn('组件已卸载，不再创建新iframe');
      return null;
    }

    const iframe = document.createElement('iframe');
    
    // 设置基础iframe属性
    iframe.style.display = options.display || 'none';
    iframe.style.width = options.width || '0';
    iframe.style.height = options.height || '0';
    iframe.style.border = options.border || '0';
    
    // 添加跨域支持和安全配置
    if (options.crossOrigin) {
      iframe.setAttribute('crossorigin', options.crossOrigin);
    }
    
    // 添加sandbox属性以增强安全性（可选）
    if (options.sandbox) {
      iframe.setAttribute('sandbox', options.sandbox);
    }
    
    // 设置referrer策略
    if (options.referrerPolicy) {
      iframe.setAttribute('referrerpolicy', options.referrerPolicy);
    }
    
    // 包装onload回调，添加安全检查和跨域处理
    iframe.onload = (e) => {
      if (this.componentUnmounted) {
        console.warn('组件已卸载，忽略iframe onload回调');
        return;
      }

      let data = {};
      try {
        // 安全获取iframe内容，处理跨域情况
        try {
          if (iframe.contentDocument && iframe.contentDocument.body) {
            const content = iframe.contentDocument.body.children[0]?.textContent || '{}';
            data = JSON.parse(content);
          } else {
            console.warn('iframe内容不可访问，可能是跨域限制');
            data = { crossOrigin: true };
          }
        } catch (crossErr) {
          console.warn('无法访问iframe内容（跨域限制）:', crossErr.message);
          data = { crossOrigin: true, error: crossErr.message };
        }
      } catch (err) {
        console.error('解析iframe内容失败:', err);
        data = { parseError: err.message };
      }

      // 处理回调参数
      const callbackKey = this.extractCallbackKey(src);
      if (callbackKey) {
        this.safeCallCallback(callbackKey, data);
      }

      // 执行自定义onload回调
      if (typeof options.onload === 'function') {
        try {
          options.onload.call(iframe, e, data);
        } catch (err) {
          console.error('执行自定义onload回调时发生错误:', err);
        }
      }
    };
    
    // 包装onerror回调
    if (typeof options.onerror === 'function') {
      iframe.onerror = (e) => {
        if (this.componentUnmounted) {
          console.warn('组件已卸载，忽略iframe onerror回调');
          return;
        }
        try {
          options.onerror.call(iframe, e);
        } catch (err) {
          console.error('执行自定义onerror回调时发生错误:', err);
        }
      };
    }

    // 设置src
    iframe.setAttribute('src', src);
    
    // 插入到DOM
    const parent = options.parent || document.body;
    parent.appendChild(iframe);
    
    // 存储元素引用
    this.dynamicElements.push({ 
      element: iframe, 
      type: 'iframe', 
      src: src, 
      options: options 
    });
    
    // 设置自动清理定时器
    if (options.autoRemove !== false) {
      const timer = setTimeout(() => {
        this.removeElement(iframe);
      }, options.removeDelay || 3000);
      this.timers.push(timer);
    }
    
    return iframe;
  }

  /**
   * 创建动态script标签
   * @param {string} src - script的src属性
   * @param {Object} options - 配置选项
   * @returns {HTMLScriptElement} 创建的script元素
   */
  createScript(src, options = {}) {
    if (this.componentUnmounted) {
      console.warn('组件已卸载，不再创建新script');
      return null;
    }

    const script = document.createElement('script');
    
    // 设置script属性
    script.type = options.type || 'text/javascript';
    script.async = options.async !== false;
    script.defer = options.defer || false;
    
    // 添加跨域支持
    if (options.crossOrigin) {
      script.setAttribute('crossorigin', options.crossOrigin);
    }
    
    // 设置integrity属性以确保脚本完整性（可选）
    if (options.integrity) {
      script.setAttribute('integrity', options.integrity);
    }
    
    // 设置referrer策略
    if (options.referrerPolicy) {
      script.setAttribute('referrerpolicy', options.referrerPolicy);
    }
    
    // 包装onload回调，添加安全检查
    script.onload = (e) => {
      if (this.componentUnmounted) {
        console.warn('组件已卸载，忽略script onload回调');
        return;
      }

      // 处理回调参数
      const callbackKey = this.extractCallbackKey(src);
      if (callbackKey) {
        this.safeCallCallback(callbackKey, e);
      }

      // 执行自定义onload回调
      if (typeof options.onload === 'function') {
        try {
          options.onload.call(script, e);
        } catch (err) {
          console.error('执行自定义onload回调时发生错误:', err);
        }
      }
    };
    
    // 包装onerror回调
    if (typeof options.onerror === 'function') {
      script.onerror = (e) => {
        if (this.componentUnmounted) {
          console.warn('组件已卸载，忽略script onerror回调');
          return;
        }
        try {
          options.onerror.call(script, e);
        } catch (err) {
          console.error('执行自定义onerror回调时发生错误:', err);
        }
      };
    }

    // 设置src
    script.setAttribute('src', src);
    
    // 插入到DOM
    const parent = options.parent || document.head;
    parent.appendChild(script);
    
    // 存储元素引用
    this.dynamicElements.push({ 
      element: script, 
      type: 'script', 
      src: src, 
      options: options 
    });
    
    // 设置自动清理定时器
    if (options.autoRemove !== false) {
      const timer = setTimeout(() => {
        this.removeElement(script);
      }, options.removeDelay || 3000);
      this.timers.push(timer);
    }
    
    return script;
  }

  /**
   * 安全调用回调函数
   * @param {string} callbackKey - 回调函数的唯一标识
   * @param {*} data - 传递给回调函数的数据
   */
  safeCallCallback(callbackKey, data) {
    if (this.componentUnmounted) {
      console.warn('组件已卸载，不再调用回调');
      return;
    }

    const callback = this.callbacks[callbackKey];
    if (typeof callback === 'function') {
      try {
        callback(data);
      } catch (err) {
        console.error('调用回调函数时发生错误:', err);
      }
    } else {
      console.warn('回调函数不存在或已被清理:', callbackKey);
    }
    
    // 调用后清理回调
    this.removeCallback(callbackKey);
  }

  /**
   * 从URL中提取回调键
   * @param {string} url - URL字符串
   * @returns {string|null} 回调键或null
   */
  extractCallbackKey(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('callback') || 
             urlObj.searchParams.get('__callback__') || 
             urlObj.searchParams.get('cb');
    } catch (err) {
      // 如果URL解析失败，尝试正则匹配
      const match = url.match(/callback[_=]([^&]+)/i);
      return match ? match[1] : null;
    }
  }

  /**
   * 移除动态元素
   * @param {HTMLElement} element - 要移除的元素
   */
  removeElement(element) {
    if (!element) {
      return;
    }
    
    // 清理事件监听器
    try {
      if (element.onload) {
        element.onload = null;
      }
      if (element.onerror) {
        element.onerror = null;
      }
      if (element.onreadystatechange) {
        element.onreadystatechange = null;
      }
    } catch (err) {
      console.warn('清理元素事件监听器时发生错误:', err);
    }
    
    // 移除元素
    if (element.parentNode) {
      try {
        element.parentNode.removeChild(element);
      } catch (err) {
        console.warn('移除元素时发生错误:', err);
      }
    }
    
    // 从数组中移除引用
    const index = this.dynamicElements.findIndex(item => 
      item === element || (item.element && item.element === element)
    );
    if (index > -1) {
      this.dynamicElements.splice(index, 1);
    }
  }

  /**
   * 移除回调函数
   * @param {string} callbackKey - 回调函数的唯一标识
   */
  removeCallback(callbackKey) {
    if (this.callbacks[callbackKey]) {
      delete this.callbacks[callbackKey];
    }
  }

  /**
   * 清理所有资源
   */
  cleanup() {
    this.componentUnmounted = true;
    
    // 清理所有回调
    Object.keys(this.callbacks).forEach(key => {
      delete this.callbacks[key];
    });
    
    // 移除所有动态元素
    this.dynamicElements.forEach(item => {
      const element = item.element || item;
      this.removeElement(element);
    });
    this.dynamicElements = [];
    
    // 清理所有定时器
    this.timers.forEach(timer => {
      clearTimeout(timer);
    });
    this.timers = [];
  }
  
  /**
   * 获取所有动态元素
   * @returns {Array} 动态元素数组
   */
  getDynamicElements() {
    return this.dynamicElements.map(item => {
      if (item.element) {
        return item.element;
      }
      return item;
    });
  }
  
  /**
   * 获取所有回调函数
   * @returns {Object} 回调函数对象
   */
  getCallbacks() {
    return { ...this.callbacks };
  }
}

/**
 * 创建一个Vue 3的组合式函数，用于在组件中管理动态标签
 * @returns {Object} 动态标签管理器和操作方法
 */
export function useDynamicFrames() {
  const frameManager = new DynamicFrameManager();

  // 在组件卸载时自动清理
  onBeforeUnmount(() => {
    frameManager.cleanup();
  });

  return {
    frameManager,
    registerCallback: (callback) => frameManager.registerCallback(callback),
    createIframe: (src, options) => frameManager.createIframe(src, options),
    createScript: (src, options) => frameManager.createScript(src, options),
    cleanup: () => frameManager.cleanup()
  };
}

/**
 * Vue 2的混入，用于在组件中管理动态标签
 */
export const dynamicFramesMixin = {
  data() {
    return {
      frameManager: null
    };
  },
  mounted() {
    this.frameManager = new DynamicFrameManager();
  },
  beforeDestroy() {
    if (this.frameManager) {
      this.frameManager.cleanup();
    }
  },
  methods: {
    registerDynamicCallback(callback) {
      return this.frameManager?.registerCallback(callback);
    },
    createDynamicIframe(src, options) {
      return this.frameManager?.createIframe(src, options);
    },
    createDynamicScript(src, options) {
      return this.frameManager?.createScript(src, options);
    }
  }
};

// 导入Vue 3的生命周期钩子
let onBeforeUnmount;
try {
  const { onBeforeUnmount: vueOnBeforeUnmount } = require('vue');
  onBeforeUnmount = vueOnBeforeUnmount;
} catch (err) {
  // 如果是Vue 2环境，onBeforeUnmount将在mixin中处理
  onBeforeUnmount = () => {};
}
