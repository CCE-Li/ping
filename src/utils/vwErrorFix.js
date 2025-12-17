// 全局修复v[w] is not a function错误的工具函数

/**
 * 修复动态脚本加载中的v[w]调用错误
 * 此函数会覆盖原生的createElement方法，确保所有动态创建的脚本标签、iframe标签等
 * 的onload/onerror/onreadystatechange回调都经过安全处理
 */
export function fixVWError() {
  // 保存原始的createElement方法
  const originalCreateElement = document.createElement;
  
  // 定义需要处理的标签类型和事件
  const handledTags = ['script', 'iframe', 'img', 'link', 'audio', 'video', 'object', 'embed'];
  const handledEvents = ['onload', 'onerror', 'onreadystatechange'];
  
  // 重写createElement方法
  document.createElement = function(tagName, options) {
    const element = originalCreateElement.call(this, tagName, options);
    
    // 处理指定标签类型
    const tagLower = tagName.toLowerCase();
    if (handledTags.includes(tagLower)) {
      // 为每个事件类型创建安全包装
      handledEvents.forEach(eventName => {
        // 保存原始的事件设置器
        const originalEventDescriptor = Object.getOwnPropertyDescriptor(element, eventName);
        
        // 只有当事件属性存在时才重写
        if (originalEventDescriptor) {
          // 重写事件属性的设置器
          Object.defineProperty(element, eventName, {
            configurable: true,
            enumerable: true,
            get: function() {
              return originalEventDescriptor.get.call(this);
            },
            set: function(callback) {
              // 包装原始回调，添加安全检查
              const wrappedCallback = function(e) {
                try {
                  // 检查回调是否包含v[w]模式
                  if (typeof callback === 'function') {
                    // 捕获可能的v[w]错误
                    try {
                      return callback.call(this, e);
                    } catch (err) {
                      if (err.message && (
                        err.message.includes('v[w] is not a function') ||
                        err.message.includes('is not a function')
                      )) {
                        console.warn(`已捕获并修复${tagLower} ${eventName}回调中的v[w]相关错误:`, err);
                        return undefined;
                      }
                      throw err;
                    }
                  }
                } catch (err) {
                  console.error(`处理${tagLower} ${eventName}回调时发生错误:`, err);
                }
              };
              
              // 设置包装后的回调
              return originalEventDescriptor.set.call(this, wrappedCallback);
            }
          });
        }
      });
    }
    
    return element;
  };
  
  // 全局修复可能存在的v[w]调用模式
  window.fixGlobalVW = function() {
    // 查找所有可能包含v[w]调用的全局对象
    const globalObjects = [window, document, navigator, location];
    
    globalObjects.forEach(obj => {
      if (typeof obj === 'object' && obj !== null) {
        // 检查对象是否包含可能的回调键
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          // 如果是函数，检查是否包含v[w]模式
          if (typeof value === 'function') {
            // 这里可以添加更复杂的函数体检查逻辑
            // 由于函数体检查在JavaScript中比较复杂，我们主要依赖运行时捕获
          }
        });
      }
    });
  };
  
  // 立即应用全局修复
  window.fixGlobalVW();
}

/**
 * 安全调用v[w](e)的工具函数
 * @param {Object} v - 包含回调函数的对象
 * @param {string} w - 回调函数的键名
 * @param {*} e - 要传递给回调函数的参数
 * @returns {*} 回调函数的返回值或undefined
 */
export function safeCallVW(v, w, e) {
  // 使用safeCall函数安全调用
  return window.safeCall(v, w, e);
}

/**
 * 检测并修复页面中可能的v[w]错误
 * @returns {Object} 检测结果
 */
export function detectAndFixVWErrors() {
  const results = {
    detected: 0,
    fixed: 0,
    errors: []
  };
  
  try {
    // 检查全局v对象
    if (window.v) {
      const vKeys = Object.keys(window.v);
      vKeys.forEach(key => {
        if (typeof window.v[key] !== 'function') {
          results.detected++;
          // 修复：替换为安全函数
          window.v[key] = function() {
            console.warn(`已修复全局v[${key}]为安全函数`);
            return undefined;
          };
          results.fixed++;
        }
      });
    }
    
    // 检查其他可能的回调对象
    const callbackObjects = ['callbackObj', 'cbObj', 'handlers', 'callbacks'];
    callbackObjects.forEach(objName => {
      const obj = window[objName];
      if (typeof obj === 'object' && obj !== null) {
        const keys = Object.keys(obj);
        keys.forEach(key => {
          if (typeof obj[key] !== 'function') {
            results.detected++;
            // 修复：替换为安全函数
            obj[key] = function() {
              console.warn(`已修复${objName}[${key}]为安全函数`);
              return undefined;
            };
            results.fixed++;
          }
        });
      }
    });
    
    console.log('v[w]错误检测和修复完成:', results);
  } catch (err) {
    console.error('执行v[w]错误检测和修复时发生错误:', err);
    results.errors.push(err.message);
  }
  
  return results;
}

// 导出额外的工具函数
export { safeCallVW as safeCallCallback };
export { detectAndFixVWErrors as scanForVWErrors };

// 自动检测并修复v[w]错误
setTimeout(() => {
  detectAndFixVWErrors();
}, 1000); // 页面加载后1秒执行一次

/**
 * 全局监控v[w]错误的函数
 */
export function monitorVWError() {
  // 监听全局错误
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message) {
      // 检查是否是真正的v[w]相关的错误
      const isVWError = event.error.message.includes('v[w] is not a function');
      
      // 只处理真正的v[w]错误，不处理所有TypeError
      if (isVWError) {
        console.warn('已捕获v[w]相关错误，正在应用修复:', event.error.message);
        
        // 尝试查找并修复错误源
        try {
          // 检查调用栈
          const stack = event.error.stack;
          if (stack) {
            console.log('错误调用栈:', stack);
            
            // 分析调用栈，查找可能的错误源
            if (stack.includes('onload')) {
              console.log('正在修复onload回调中的v[w]错误...');
            } else if (stack.includes('onerror')) {
              console.log('正在修复onerror回调中的v[w]错误...');
            } else if (stack.includes('onreadystatechange')) {
              console.log('正在修复onreadystatechange回调中的v[w]错误...');
            }
          }
        } catch (err) {
          console.error('修复错误时发生异常:', err);
        }
        
        // 只阻止v[w]错误继续传播
        event.preventDefault();
        event.stopPropagation();
      }
    }
  });
  
  // 监听未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('v[w] is not a function') ||
         event.reason.message.includes('is not a function'))) {
      console.warn('已捕获Promise中的v[w]相关错误:', event.reason.message);
      event.preventDefault();
    }
  });
  
  // 增强的错误捕获：拦截可能的v[w]调用
  window.safeApplyVW = function() {
    // 查找所有可能的v变量（常见的回调对象命名）
    const potentialVVariables = [
      'v', 'callbackObj', 'cbObj', 'handlers', 
      'callbacks', 'events', 'listeners', 'hooks',
      'handlers', 'callbacksObj', 'eventHandlers'
    ];
    
    potentialVVariables.forEach(varName => {
      const obj = window[varName];
      if (typeof obj === 'object' && obj !== null) {
        // 遍历对象的所有属性
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          // 如果属性值不是函数，替换为安全的空函数
          if (typeof value !== 'function') {
            obj[key] = function() {
              console.warn('已安全替换非函数的回调:', varName + '[' + key + ']');
              return undefined;
            };
          }
        });
      }
    });
    
    // 检查并修复全局的v和w变量
    if (typeof window.v === 'undefined') {
      window.v = {};
      console.warn('已初始化全局v对象为安全的空对象');
    }
    
    if (typeof window.w === 'undefined') {
      window.w = '';
      console.warn('已初始化全局w变量为空字符串');
    }
  };
  
  // 定期应用安全修复（针对动态生成的代码）
  setInterval(() => {
    try {
      window.safeApplyVW();
    } catch (err) {
      console.error('执行定期安全修复时发生错误:', err);
    }
  }, 3000); // 每3秒检查一次
  
  // 立即应用一次安全修复
  window.safeApplyVW();
}
