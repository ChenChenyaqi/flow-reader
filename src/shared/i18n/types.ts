export type SupportedLocale = 'zh-CN' | 'en-US'

export interface LanguageConfig {
  locale: SupportedLocale
  lastUpdated: number
}

export const LOCALE_OPTIONS: Array<{
  value: SupportedLocale
  label: string
  nativeName: string
}> = [
  { value: 'zh-CN', label: '简体中文', nativeName: '简体中文' },
  { value: 'en-US', label: 'English', nativeName: 'English' },
]

/**
 * Get the default locale based on browser language
 * @returns The default locale (zh-CN or en-US)
 */
export function getDefaultLocale(): SupportedLocale {
  const browserLang = navigator.language || 'en-US'

  // Check if browser language is Chinese
  if (browserLang.startsWith('zh')) {
    return 'zh-CN'
  }

  // Default to English for other languages
  return 'en-US'
}

/**
 * Check if a locale is supported
 * @param locale - The locale to check
 * @returns True if the locale is supported
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale === 'zh-CN' || locale === 'en-US'
}
