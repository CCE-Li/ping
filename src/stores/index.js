// 导入Pinia的createPinia函数，用于创建Pinia实例
import { createPinia } from 'pinia'

// 创建Pinia实例
// Pinia是Vue的状态管理库，用于集中管理应用状态
// 该实例会被main.js导入并注册到Vue应用中
export const pinia = createPinia()