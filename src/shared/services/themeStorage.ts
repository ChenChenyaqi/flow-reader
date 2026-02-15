import type { ThemeConfig, ThemeMode } from '@/shared/types/theme'

class ThemeStorageService {
  private readonly THEME_KEY = 'flow-reader-theme'

  private getDefaultConfig(): ThemeConfig {
    return {
      mode: 'dark',
      lastUpdated: Date.now(),
    }
  }

  async getTheme(): Promise<ThemeConfig> {
    const result = await chrome.storage.local.get(this.THEME_KEY)
    return result[this.THEME_KEY] || this.getDefaultConfig()
  }

  async setTheme(mode: ThemeMode): Promise<void> {
    const config: ThemeConfig = {
      mode,
      lastUpdated: Date.now(),
    }
    await chrome.storage.local.set({
      [this.THEME_KEY]: config,
    })
  }

  async init(): Promise<ThemeConfig> {
    const config = await this.getTheme()
    return config
  }
}

export const themeStorage = new ThemeStorageService()
