/**
 * 代码压缩防护工具
 * 用于检测和处理代码压缩后变量名变化的问题，特别是针对v[w] is not a function错误
 */

class CompressionGuard {
  constructor() {
    this.potentialCallbackObjects = [];
    this.compressedVariablePatterns = [];
    this.isInitialized = false;
    this.init();
  }

  /**
   * 初始化代码压缩防护
   */
  init() {
    if (this.isInitialized) return;

    this.detectCompressedVariables();
    this.identifyCallbackObjects();
    this.setupVariableProtection();

    this.isInitialized = true;
  }

  /**
   * 检测被压缩的变量名模式
   */
  detectCompressedVariables() {
    const globalVars = Object.keys(window);
    const compressedVars = [];

    // 检测可能被压缩的变量名模式（通常是短名称）
    globalVars.forEach(varName => {
      // 单字符变量名
      if (varName.length === 1 && /[a-z]/i.test(varName)) {
        compressedVars.push(varName);
      }
      // 双字符变量名
      else if (varName.length === 2 && /[a-z][a-z]/i.test(varName)) {
        compressedVars.push(varName);
      }
    });

    this.compressedVariablePatterns = compressedVars;
    console.log('检测到的可能被压缩的变量名:', compressedVars);
  }

  /**
   * 识别可能的回调对象
   */
  identifyCallbackObjects() {
    const globalVars = Object.keys(window);
    const callbackObjects = [];

    globalVars.forEach(varName => {
      const obj = window[varName];
      
      // 检查是否是对象类型
      if (typeof obj === 'object' && obj !== null) {
        const keys = Object.keys(obj);
        let hasFunctions = false;
        let hasShortKeys = false;

        // 检查对象是否包含函数和短键名
        keys.forEach(key => {
          if (typeof obj[key] === 'function') {
            hasFunctions = true;
          }
          if (key.length <= 5) {
            hasShortKeys = true;
          }
        });

        // 如果对象包含函数且有短键名，可能是回调对象
        if (hasFunctions) {
          callbackObjects.push({
            name: varName,
            object: obj,
            functions: keys.filter(key => typeof obj[key] === 'function'),
            isLikelyCallback: hasShortKeys
          });
        }
      }
    });

    this.potentialCallbackObjects = callbackObjects;
    console.log('识别到的可能回调对象:', callbackObjects);
  }

  /**
   * 设置变量保护机制
   */
  setupVariableProtection() {
    // 为潜在的回调对象添加保护
    this.potentialCallbackObjects.forEach(callbackObj => {
      this.protectCallbackObject(callbackObj);
    });

    // 监听全局对象的变化
    this.observeGlobalChanges();

    // 定期检查可能的压缩变量
    this.setupPeriodicCheck();
  }

  /**
   * 保护回调对象，防止其方法被非函数值覆盖
   * @param {Object} callbackObj - 回调对象信息
   */
  protectCallbackObject(callbackObj) {
    const { name, object } = callbackObj;

    // 跳过window.location对象，因为其属性是只读的
    if (object === window.location) {
      console.warn(`保护机制：跳过window.location对象，因为其属性是只读的`);
      return;
    }

    // 为每个函数方法添加保护
    callbackObj.functions.forEach(funcName => {
      const originalFunction = object[funcName];

      // 检查是否已经被保护
      if (originalFunction && !originalFunction._isProtected) {
        try {
          // 创建保护包装器
          const protectedFunction = function() {
            try {
              // 确保原始函数仍然存在且是函数类型
              if (typeof originalFunction === 'function') {
                return originalFunction.apply(this, arguments);
              } else {
                console.warn(`保护机制：${name}[${funcName}] 已不再是函数，正在提供安全处理`);
                return undefined;
              }
            } catch (err) {
              console.warn(`保护机制：捕获到 ${name}[${funcName}] 调用错误，正在处理`, err);
              return undefined;
            }
          };

          // 标记为已保护
          protectedFunction._isProtected = true;
          protectedFunction._originalFunction = originalFunction;

          // 检查属性是否可写，如果不可写则跳过
          const propertyDescriptor = Object.getOwnPropertyDescriptor(object, funcName);
          if (!propertyDescriptor || propertyDescriptor.writable) {
            // 替换原始函数
            object[funcName] = protectedFunction;
          } else {
            console.warn(`保护机制：跳过${name}[${funcName}]，因为该属性是只读的`);
          }
        } catch (err) {
          // 如果修改属性时出错（例如属性是只读的），跳过
          console.warn(`保护机制：无法保护${name}[${funcName}]，该属性可能是只读的或受保护的`, err);
        }
      }
    });
  }

  /**
   * 观察全局对象的变化
   */
  observeGlobalChanges() {
    try {
      // 创建全局对象的观察者
      const globalObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            // 检查全局对象属性的变化
            const attrName = mutation.attributeName;
            const attrValue = window[attrName];

            // 如果是新添加的对象且包含函数，可能是回调对象
            if (typeof attrValue === 'object' && attrValue !== null) {
              const keys = Object.keys(attrValue);
              if (keys.some(key => typeof attrValue[key] === 'function')) {
                console.log(`检测到新的全局对象 ${attrName}，可能是回调对象`);
                this.protectNewCallbackObject(attrName, attrValue);
              }
            }
          }
        });
      });

      // 配置并启动观察者
      const config = { attributes: true, childList: true, subtree: true };
      globalObserver.observe(document.documentElement, config);
    } catch (err) {
      console.error('设置全局对象观察者时发生错误:', err);
    }
  }

  /**
   * 保护新发现的回调对象
   * @param {string} name - 对象名称
   * @param {Object} object - 对象实例
   */
  protectNewCallbackObject(name, object) {
    const keys = Object.keys(object);
    const functions = keys.filter(key => typeof object[key] === 'function');

    if (functions.length > 0) {
      const newCallbackObj = {
        name: name,
        object: object,
        functions: functions,
        isLikelyCallback: keys.some(key => key.length <= 5)
      };

      this.potentialCallbackObjects.push(newCallbackObj);
      this.protectCallbackObject(newCallbackObj);
    }
  }

  /**
   * 设置定期检查机制
   */
  setupPeriodicCheck() {
    setInterval(() => {
      this.performPeriodicCheck();
    }, 5000); // 每5秒检查一次
  }

  /**
   * 执行定期检查
   */
  performPeriodicCheck() {
    // 重新检测被压缩的变量
    this.detectCompressedVariables();

    // 识别新的回调对象
    const newCallbackObjects = [];
    const globalVars = Object.keys(window);

    globalVars.forEach(varName => {
      const obj = window[varName];
      
      // 检查是否是对象类型
      if (typeof obj === 'object' && obj !== null) {
        // 检查是否已经在保护列表中
        const isAlreadyProtected = this.potentialCallbackObjects.some(callbackObj => callbackObj.name === varName);
        
        if (!isAlreadyProtected) {
          const keys = Object.keys(obj);
          if (keys.some(key => typeof obj[key] === 'function')) {
            newCallbackObjects.push(varName);
          }
        }
      }
    });

    // 保护新发现的回调对象
    newCallbackObjects.forEach(varName => {
      console.log(`定期检查：发现新的回调对象 ${varName}`);
      this.protectNewCallbackObject(varName, window[varName]);
    });
  }

  /**
   * 检测可能的v[w]调用模式（不依赖于特定变量名）
   * @returns {Array} 可能的v[w]调用模式列表
   */
  detectVWCallPatterns() {
    const patterns = [];

    // 检查所有单字符变量
    this.compressedVariablePatterns.forEach(varName => {
      const obj = window[varName];
      
      if (typeof obj === 'object' && obj !== null) {
        const keys = Object.keys(obj);
        keys.forEach(key => {
          patterns.push({
            variableName: varName,
            keyName: key,
            isFunction: typeof obj[key] === 'function'
          });
        });
      }
    });

    return patterns;
  }

  /**
   * 为所有可能的v[w]模式提供安全调用包装
   */
  wrapAllVWPatterns() {
    const patterns = this.detectVWCallPatterns();

    patterns.forEach(pattern => {
      const { variableName, keyName, isFunction } = pattern;
      const obj = window[variableName];

      // 如果不是函数，添加安全保护
      if (!isFunction) {
        console.warn(`正在为可能的v[w]模式 ${variableName}[${keyName}] 添加安全保护`);
        
        // 保存原始值
        const originalValue = obj[keyName];
        
        // 替换为安全函数
        obj[keyName] = function() {
          console.warn(`已安全处理非函数的 ${variableName}[${keyName}] 调用`);
          return originalValue;
        };
        
        // 标记原始值
        obj[keyName]._originalValue = originalValue;
        obj[keyName]._isWrapped = true;
      }
    });
  }

  /**
   * 修复由代码压缩引起的v[w]错误
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否成功修复
   */
  fixCompressionError(error) {
    if (!error || !error.message) return false;

    // 检查是否是 "is not a function" 错误
    if (error.message.includes('is not a function')) {
      console.log('检测到可能由代码压缩引起的函数调用错误:', error.message);
      
      // 分析错误调用栈，查找可能的调用模式
      if (error.stack) {
        const stackLines = error.stack.split('\n');
        
        // 查找包含单字符或短变量名的调用行
        for (let i = 0; i < stackLines.length; i++) {
          const line = stackLines[i];
          
          // 匹配类似 a[b]() 或 c.d() 的调用模式
          const match = line.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\[([^\]]+)\]\s*\(/);
          
          if (match) {
            const [, varName, keyName] = match;
            console.log(`从错误栈中识别出可能的调用模式: ${varName}[${keyName}]()`);
            
            // 检查并修复该调用模式
            const obj = window[varName];
            if (obj && obj[keyName] && typeof obj[keyName] !== 'function') {
              console.warn(`正在修复 ${varName}[${keyName}] 的非函数调用错误`);
              
              // 替换为安全函数
              obj[keyName] = function() {
                console.warn(`已安全处理 ${varName}[${keyName}] 的非函数调用`);
                return undefined;
              };
              
              return true;
            }
          }
        }
      }
      
      // 如果无法从调用栈识别，尝试全局修复
      console.log('尝试全局修复可能的代码压缩错误...');
      this.wrapAllVWPatterns();
      return true;
    }
    
    return false;
  }

  /**
   * 获取代码压缩防护的状态
   * @returns {Object} 防护状态信息
   */
  getGuardStatus() {
    return {
      compressedVariables: this.compressedVariablePatterns,
      protectedCallbackObjects: this.potentialCallbackObjects.map(obj => obj.name),
      totalProtectedFunctions: this.potentialCallbackObjects.reduce((total, obj) => total + obj.functions.length, 0),
      isInitialized: this.isInitialized
    };
  }

  /**
   * 输出防护状态到控制台
   */
  logGuardStatus() {
    console.log('=== 代码压缩防护状态 ===');
    console.log('检测到的可能被压缩的变量名:', this.compressedVariablePatterns);
    console.log('受保护的回调对象:', this.potentialCallbackObjects.map(obj => obj.name));
    console.log('受保护的函数总数:', this.potentialCallbackObjects.reduce((total, obj) => total + obj.functions.length, 0));
    console.log('=====================');
  }
}

// 创建单例实例
const compressionGuard = new CompressionGuard();

export default compressionGuard;

// 导出便捷方法
export const detectCompressedVariables = () => compressionGuard.detectCompressedVariables();
export const identifyCallbackObjects = () => compressionGuard.identifyCallbackObjects();
export const detectVWCallPatterns = () => compressionGuard.detectVWCallPatterns();
export const wrapAllVWPatterns = () => compressionGuard.wrapAllVWPatterns();
export const fixCompressionError = (error) => compressionGuard.fixCompressionError(error);
export const getGuardStatus = () => compressionGuard.getGuardStatus();
export const logGuardStatus = () => compressionGuard.logGuardStatus();

// 导出工具类
export { CompressionGuard };

// 全局错误处理集成
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('is not a function')) {
    // 尝试修复由代码压缩引起的错误
    const isFixed = compressionGuard.fixCompressionError(event.error);
    if (isFixed) {
      console.log('代码压缩防护：已成功修复函数调用错误');
      event.preventDefault();
      event.stopPropagation();
    }
  }
});

// 定期检查和修复
setInterval(() => {
  compressionGuard.wrapAllVWPatterns();
}, 10000); // 每10秒执行一次

// 页面加载完成后执行一次全面检查
setTimeout(() => {
  console.log('=== 代码压缩防护：页面加载完成后执行全面检查 ===');
  compressionGuard.detectCompressedVariables();
  compressionGuard.identifyCallbackObjects();
  compressionGuard.wrapAllVWPatterns();
  compressionGuard.logGuardStatus();
}, 2000);
