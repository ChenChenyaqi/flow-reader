import { createApp } from 'vue'
import LensOverlay from './LensOverlay.vue'
import tailwindContent from '../assets/tailwind.css?inline'
import { vocabularyState } from '@/shared/services/vocabularyState'
import { initializeI18n } from '@/shared/i18n'

// 创建宿主元素
const host = document.createElement('div')
host.id = 'fluent-read-host'
document.body.appendChild(host)

// 创建 Shadow DOM
const shadow = host.attachShadow({ mode: 'open' })
const style = document.createElement('style')
style.textContent = tailwindContent
shadow.appendChild(style)

// 创建 Vue 挂载点
const appContainer = document.createElement('div')
appContainer.id = 'app'
shadow.appendChild(appContainer)

// ========== 关键：在这里初始化全局词汇状态 ==========
async function initializeApp() {
  // 1. 初始化词汇状态（必须在创建 Vue app 之前完成）
  await vocabularyState.init()

  // 2. 初始化 i18n（加载用户语言偏好或使用浏览器默认语言）
  const i18n = await initializeI18n()

  // 3. 挂载 LensOverlay 组件（传入 i18n）
  const app = createApp(LensOverlay)
  app.use(i18n)
  app.mount(appContainer)

  console.log('[FluentRead] Content script initialized')
}

initializeApp().catch(err => {
  console.error('[FluentRead] Initialization failed:', err)
})
