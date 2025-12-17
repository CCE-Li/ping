/**
 * 环境检测工具类
 * 用于检测当前的运行环境，包括浏览器、设备、操作系统、环境类型等
 */

class EnvironmentDetector {
  constructor() {
    this.userAgent = navigator.userAgent || navigator.vendor || window.opera;
    this.platform = navigator.platform;
    this.location = window.location;
    this.isInitialized = false;
    this.environment = {};
    this.init();
  }

  /**
   * 初始化环境检测
   */
  init() {
    if (this.isInitialized) return;

    this.detectBrowser();
    this.detectDevice();
    this.detectOS();
    this.detectEnvironmentType();
    this.detectSDKEnvironment();
    this.detectPerformance();

    this.isInitialized = true;
  }

  /**
   * 检测浏览器信息
   */
  detectBrowser() {
    const ua = this.userAgent.toLowerCase();

    this.environment.browser = {
      name: 'Unknown',
      version: 'Unknown',
      fullVersion: 'Unknown'
    };

    // 检测主要浏览器
    if (ua.includes('chrome')) {
      const match = ua.match(/chrome\/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
      this.environment.browser = {
        name: 'Chrome',
        version: match ? match[1] : 'Unknown',
        fullVersion: match ? match[0].replace('chrome/', '') : 'Unknown'
      };
    } else if (ua.includes('firefox')) {
      const match = ua.match(/firefox\/(\d+)\.(\d+)/);
      this.environment.browser = {
        name: 'Firefox',
        version: match ? match[1] : 'Unknown',
        fullVersion: match ? match[0].replace('firefox/', '') : 'Unknown'
      };
    } else if (ua.includes('safari')) {
      const match = ua.match(/version\/(\d+)\.(\d+)/);
      this.environment.browser = {
        name: 'Safari',
        version: match ? match[1] : 'Unknown',
        fullVersion: match ? match[0].replace('version/', '') : 'Unknown'
      };
    } else if (ua.includes('edge')) {
      const match = ua.match(/edge\/(\d+)\.(\d+)/);
      this.environment.browser = {
        name: 'Edge',
        version: match ? match[1] : 'Unknown',
        fullVersion: match ? match[0].replace('edge/', '') : 'Unknown'
      };
    } else if (ua.includes('msie') || ua.includes('trident')) {
      const match = ua.match(/(msie|trident).+(\d+)\.(\d+)/);
      this.environment.browser = {
        name: 'Internet Explorer',
        version: match ? match[2] : 'Unknown',
        fullVersion: match ? `${match[2]}.${match[3]}` : 'Unknown'
      };
    }
  }

  /**
   * 检测设备类型
   */
  detectDevice() {
    const ua = this.userAgent.toLowerCase();
    const platform = this.platform.toLowerCase();

    this.environment.device = {
      type: 'Desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };

    // 检测移动设备
    if (
      ua.includes('mobile') ||
      platform.includes('iphone') ||
      platform.includes('ipad') ||
      platform.includes('ipod') ||
      platform.includes('android') ||
      platform.includes('blackberry') ||
      platform.includes('windows phone')
    ) {
      this.environment.device.type = 'Mobile';
      this.environment.device.isMobile = true;
      this.environment.device.isDesktop = false;

      // 检测平板设备
      if (
        ua.includes('ipad') ||
        (ua.includes('android') && !ua.includes('mobile')) ||
        platform.includes('tablet')
      ) {
        this.environment.device.type = 'Tablet';
        this.environment.device.isTablet = true;
        this.environment.device.isMobile = false;
      }
    }
  }

  /**
   * 检测操作系统
   */
  detectOS() {
    const ua = this.userAgent.toLowerCase();
    const platform = this.platform.toLowerCase();

    this.environment.os = {
      name: 'Unknown',
      version: 'Unknown'
    };

    // 检测主要操作系统
    if (ua.includes('windows')) {
      const match = ua.match(/windows nt (\d+)\.(\d+)/);
      this.environment.os = {
        name: 'Windows',
        version: match ? `${match[1]}.${match[2]}` : 'Unknown'
      };
    } else if (ua.includes('mac')) {
      const match = ua.match(/mac os x (\d+)_(\d+)_(\d+)/);
      this.environment.os = {
        name: 'macOS',
        version: match ? `${match[1]}.${match[2]}.${match[3]}` : 'Unknown'
      };
    } else if (ua.includes('linux')) {
      this.environment.os = {
        name: 'Linux',
        version: 'Unknown'
      };
    } else if (ua.includes('android')) {
      const match = ua.match(/android (\d+)\.(\d+)/);
      this.environment.os = {
        name: 'Android',
        version: match ? `${match[1]}.${match[2]}` : 'Unknown'
      };
    } else if (ua.includes('ios') || platform.includes('iphone') || platform.includes('ipad') || platform.includes('ipod')) {
      const match = ua.match(/os (\d+)_(\d+)_(\d+)/);
      this.environment.os = {
        name: 'iOS',
        version: match ? `${match[1]}.${match[2]}.${match[3]}` : 'Unknown'
      };
    }
  }

  /**
   * 检测环境类型（开发/测试/生产）
   */
  detectEnvironmentType() {
    const hostname = this.location.hostname;
    const pathname = this.location.pathname;

    this.environment.envType = {
      type: 'production',
      isDevelopment: false,
      isTest: false,
      isProduction: true
    };

    // 根据域名和路径检测环境
    if (
      hostname.includes('localhost') ||
      hostname.includes('127.0.0.1') ||
      hostname.includes('.test') ||
      hostname.includes('.dev') ||
      pathname.includes('/test/') ||
      pathname.includes('/dev/')
    ) {
      this.environment.envType = {
        type: 'development',
        isDevelopment: true,
        isTest: false,
        isProduction: false
      };
    } else if (
      hostname.includes('.staging') ||
      hostname.includes('.qa') ||
      hostname.includes('.uat') ||
      pathname.includes('/staging/') ||
      pathname.includes('/qa/')
    ) {
      this.environment.envType = {
        type: 'test',
        isDevelopment: false,
        isTest: true,
        isProduction: false
      };
    }
  }

  /**
   * 检测SDK环境（如Hybrid环境、小程序环境等）
   */
  detectSDKEnvironment() {
    this.environment.sdk = {
      isHybrid: false,
      isWechat: false,
      isAlipay: false,
      isBaidu: false,
      isApp: false,
      appName: '',
      appVersion: ''
    };

    // 检测Hybrid环境
    if (window.webkit && window.webkit.messageHandlers) {
      this.environment.sdk.isHybrid = true;
      this.environment.sdk.isApp = true;
    } else if (window.android) {
      this.environment.sdk.isHybrid = true;
      this.environment.sdk.isApp = true;
    }

    // 检测微信小程序环境
    if (window.__wxjs_environment === 'miniprogram' || window.wx) {
      this.environment.sdk.isWechat = true;
      this.environment.sdk.isApp = true;
    }

    // 检测支付宝小程序环境
    if (window.my && window.my['is alipay']) {
      this.environment.sdk.isAlipay = true;
      this.environment.sdk.isApp = true;
    }

    // 检测百度小程序环境
    if (window.swan) {
      this.environment.sdk.isBaidu = true;
      this.environment.sdk.isApp = true;
    }

    // 检测特定APP环境
    const ua = this.userAgent.toLowerCase();
    if (ua.includes('myapp')) {
      this.environment.sdk.appName = 'MyApp';
      this.environment.sdk.appVersion = this.getAppVersion(ua);
    }
  }

  /**
   * 从UA中提取APP版本
   */
  getAppVersion(ua) {
    const match = ua.match(/myapp\/(\d+)\.(\d+)\.(\d+)/);
    return match ? `${match[1]}.${match[2]}.${match[3]}` : 'Unknown';
  }

  /**
   * 检测性能相关信息
   */
  detectPerformance() {
    this.environment.performance = {
      isHighPerformance: true,
      supportsWebGL: false,
      supportsServiceWorker: 'serviceWorker' in navigator
    };

    // 检测设备性能
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      this.environment.performance.isHighPerformance = false;
    }

    // 检测WebGL支持
    try {
      const canvas = document.createElement('canvas');
      this.environment.performance.supportsWebGL = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      canvas.remove();
    } catch (e) {
      this.environment.performance.supportsWebGL = false;
    }
  }

  /**
   * 获取完整的环境信息
   */
  getEnvironmentInfo() {
    if (!this.isInitialized) {
      this.init();
    }
    return this.environment;
  }

  /**
   * 检测是否为iOS环境
   */
  isIOS() {
    return this.environment.os.name === 'iOS';
  }

  /**
   * 检测是否为Android环境
   */
  isAndroid() {
    return this.environment.os.name === 'Android';
  }

  /**
   * 检测是否为移动端环境
   */
  isMobile() {
    return this.environment.device.isMobile;
  }

  /**
   * 检测是否为开发环境
   */
  isDevelopment() {
    return this.environment.envType.isDevelopment;
  }

  /**
   * 检测是否为生产环境
   */
  isProduction() {
    return this.environment.envType.isProduction;
  }

  /**
   * 检测是否为Hybrid环境
   */
  isHybrid() {
    return this.environment.sdk.isHybrid;
  }

  /**
   * 检测是否为微信环境
   */
  isWechat() {
    return this.environment.sdk.isWechat;
  }

  /**
   * 检测是否支持特定功能
   */
  supportsFeature(featureName) {
    const features = {
      'serviceWorker': 'serviceWorker' in navigator,
      'webStorage': 'localStorage' in window && 'sessionStorage' in window,
      'fetch': 'fetch' in window,
      'promise': 'Promise' in window,
      'websocket': 'WebSocket' in window,
      'webgl': this.environment.performance.supportsWebGL,
      'es6': 'class' in window && 'Symbol' in window
    };

    return features[featureName] || false;
  }

  /**
   * 获取环境摘要信息
   */
  getEnvironmentSummary() {
    const env = this.getEnvironmentInfo();
    return {
      browser: `${env.browser.name} ${env.browser.version}`,
      device: env.device.type,
      os: `${env.os.name} ${env.os.version}`,
      envType: env.envType.type,
      isHybrid: env.sdk.isHybrid,
      isMobile: env.device.isMobile
    };
  }

  /**
   * 输出环境信息到控制台
   */
  logEnvironmentInfo() {
    console.log('=== 环境检测信息 ===');
    console.log('浏览器:', this.getEnvironmentSummary().browser);
    console.log('设备:', this.getEnvironmentSummary().device);
    console.log('操作系统:', this.getEnvironmentSummary().os);
    console.log('环境类型:', this.getEnvironmentSummary().envType);
    console.log('是否为Hybrid环境:', this.getEnvironmentSummary().isHybrid);
    console.log('是否为移动端:', this.getEnvironmentSummary().isMobile);
    console.log('===================');
  }
}

// 创建单例实例
const environmentDetector = new EnvironmentDetector();

export default environmentDetector;

// 导出便捷方法
export const isIOS = () => environmentDetector.isIOS();
export const isAndroid = () => environmentDetector.isAndroid();
export const isMobile = () => environmentDetector.isMobile();
export const isDevelopment = () => environmentDetector.isDevelopment();
export const isProduction = () => environmentDetector.isProduction();
export const isHybrid = () => environmentDetector.isHybrid();
export const isWechat = () => environmentDetector.isWechat();
export const supportsFeature = (featureName) => environmentDetector.supportsFeature(featureName);
export const getEnvironmentInfo = () => environmentDetector.getEnvironmentInfo();
export const getEnvironmentSummary = () => environmentDetector.getEnvironmentSummary();
export const logEnvironmentInfo = () => environmentDetector.logEnvironmentInfo();

// 自动输出环境信息（仅在开发环境）
if (environmentDetector.isDevelopment()) {
  setTimeout(() => {
    environmentDetector.logEnvironmentInfo();
  }, 1000);
}
