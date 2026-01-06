import { createApp } from 'vue'
import LensOverlay from './LensOverlay.vue'
import tailwindContent from '../assets/tailwind.css?inline'
import { vocabularyState } from '@/shared/services/vocabularyState'
import { initializeI18n } from '@/shared/i18n'
import { host } from './hostElement'

// create shadow dom
const shadow = host.attachShadow({ mode: 'open' })
const style = document.createElement('style')
style.textContent = tailwindContent
shadow.appendChild(style)

// app root
const appContainer = document.createElement('div')
appContainer.id = 'app'
shadow.appendChild(appContainer)

async function initializeApp() {
  // init vocabulary
  await vocabularyState.init()

  const i18n = await initializeI18n()

  const app = createApp(LensOverlay)
  app.use(i18n)
  app.mount(appContainer)

  console.log('[FluentRead] Content script initialized')
}

initializeApp().catch(err => {
  console.error('[FluentRead] Initialization failed:', err)
})
