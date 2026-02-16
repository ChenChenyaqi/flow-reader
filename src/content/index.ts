import { createApp } from 'vue'
import LensOverlay from './LensOverlay.vue'
import tailwindContent from '../assets/tailwind.css?inline'
import { vocabularyState } from '@/shared/services/vocabularyState'
import { initializeI18n } from '@/shared/i18n'
import { useTheme } from '@/content/composables/useTheme'
import { host, setAppContainer } from './hostElement'

// create shadow dom
const shadow = host.attachShadow({ mode: 'open' })
const style = document.createElement('style')
style.textContent = tailwindContent
shadow.appendChild(style)

// Custom scrollbar styles for Shadow DOM
const scrollbarStyle = document.createElement('style')
scrollbarStyle.textContent = `
  /* Scrollbar styles for FlowReader */
  .scroll-container::-webkit-scrollbar {
    width: 8px !important;
    height: 8px !important;
  }

  .scroll-container::-webkit-scrollbar-track {
    background: #ffffff !important; /* white for light mode */
    border-radius: 4px !important;
  }

  .dark .scroll-container::-webkit-scrollbar-track {
    background: #0f172a !important; /* slate-900 for dark mode */
  }

  .scroll-container::-webkit-scrollbar-thumb {
    background: #e2e8f0 !important; /* slate-200 for light mode */
    border-radius: 4px !important;
  }

  .dark .scroll-container::-webkit-scrollbar-thumb {
    background: #475569 !important; /* slate-600 for dark mode */
  }

  .scroll-container::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1 !important; /* slate-300 for light mode hover */
  }

  .dark .scroll-container::-webkit-scrollbar-thumb:hover {
    background: #64748b !important; /* slate-500 for dark mode hover */
  }

  /* Firefox scrollbar */
  .scroll-container {
    scrollbar-width: thin !important;
    scrollbar-color: #e2e8f0 #ffffff !important; /* thumb track */
  }

  .dark .scroll-container {
    scrollbar-color: #475569 #0f172a !important;
  }
`
shadow.appendChild(scrollbarStyle)

// app root
const appContainer = document.createElement('div')
appContainer.id = 'app'
shadow.appendChild(appContainer)

async function initializeApp() {
  // init vocabulary
  await vocabularyState.init()

  const i18n = await initializeI18n()

  // Set app container reference for theme management
  setAppContainer(appContainer)

  // init theme
  const { initTheme } = useTheme()
  await initTheme()

  const app = createApp(LensOverlay)
  app.use(i18n)
  app.mount(appContainer)

  console.log('[FlowReader] Content script initialized')
}

initializeApp().catch(err => {
  console.error('[FlowReader] Initialization failed:', err)
})
