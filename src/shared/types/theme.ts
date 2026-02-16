/**
 * Theme mode types
 */
export type ThemeMode = 'light' | 'dark'

/**
 * Theme configuration stored in chrome.storage.local
 */
export interface ThemeConfig {
  mode: ThemeMode
  lastUpdated: number
}
