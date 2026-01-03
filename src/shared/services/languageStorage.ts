import type { SupportedLocale, LanguageConfig } from '@/shared/i18n/types'

const STORAGE_KEY = 'fluent-read-language'

export const languageStorage = {
  /**
   * Get the saved language preference from storage
   * @returns The saved locale, or null if not set
   */
  async get(): Promise<SupportedLocale | null> {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    const config = result[STORAGE_KEY] as LanguageConfig | undefined
    return config?.locale || null
  },

  /**
   * Save the language preference to storage
   * @param locale - The locale to save
   */
  async set(locale: SupportedLocale): Promise<void> {
    const config: LanguageConfig = {
      locale,
      lastUpdated: Date.now()
    }
    await chrome.storage.local.set({ [STORAGE_KEY]: config })
  },

  /**
   * Remove the language preference from storage
   */
  async remove(): Promise<void> {
    await chrome.storage.local.remove(STORAGE_KEY)
  }
}
