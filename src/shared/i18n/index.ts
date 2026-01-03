import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'
import type { SupportedLocale } from './types'
import { languageStorage } from '@/shared/services/languageStorage'

// Create i18n instance (will be initialized with locale later)
const i18n = createI18n({
  legacy: false, // Vue 3 Composition API mode
  locale: 'zh-CN', // Will be updated after loading from storage
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
  globalInjection: true, // Global injection of $t
})

/**
 * Initialize i18n with the saved or default locale
 * @returns The initialized i18n instance
 */
export async function initializeI18n() {
  const savedLocale = await languageStorage.get()
  const defaultLocale = savedLocale || getDefaultLocale()

  i18n.global.locale.value = defaultLocale

  return i18n
}

/**
 * Get the default locale based on browser language
 */
function getDefaultLocale(): SupportedLocale {
  const browserLang = navigator.language || 'en-US'

  // Check if browser language is Chinese
  if (browserLang.startsWith('zh')) {
    return 'zh-CN'
  }

  // Default to English for other languages
  return 'en-US'
}

/**
 * Change the current locale dynamically (no page reload)
 * @param locale - The new locale to set
 */
export async function changeLocale(locale: SupportedLocale) {
  // Update i18n locale
  i18n.global.locale.value = locale

  // Save to storage
  await languageStorage.set(locale)
}

/**
 * Get the current locale
 * @returns The current locale
 */
export function getCurrentLocale(): SupportedLocale {
  return i18n.global.locale.value as SupportedLocale
}

export { i18n }
export default i18n
