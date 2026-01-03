import { createApp } from 'vue'
import LensOverlay from './LensOverlay.vue'
import tailwindContent from '../assets/tailwind.css?inline'
import { vocabularyState } from '@/shared/services/vocabularyState'

// 创建宿主元素
const host = document.createElement('div')
host.id = 'fluent-lens-host'
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
  // 初始化词汇状态（必须在创建 Vue app 之前完成）
  await vocabularyState.init()

  // 挂载 LensOverlay 组件
  const app = createApp(LensOverlay)
  app.mount(appContainer)

  console.log('[FluentLens] Content script initialized')
}

initializeApp().catch((err) => {
  console.error('[FluentLens] Initialization failed:', err)
})
