import { ref, watch } from 'vue'
import type { ThemeMode } from '@/shared/types/theme'
import { themeStorage } from '@/shared/services/themeStorage'
import { getAppContainer } from '@/content/hostElement'

const currentTheme = ref<ThemeMode>('dark')

/**
 * Theme management composable
 * Handles theme switching and applies theme to the Shadow DOM app container
 */
export function useTheme() {
  /**
   * Apply theme to the app container (inside Shadow DOM)
   */
  const applyTheme = (mode: ThemeMode) => {
    const appContainer = getAppContainer()
    if (!appContainer) return

    if (mode === 'dark') {
      appContainer.classList.add('dark')
    } else {
      appContainer.classList.remove('dark')
    }
  }

  /**
   * Initialize theme from storage
   */
  const initTheme = async () => {
    const config = await themeStorage.init()
    currentTheme.value = config.mode
    applyTheme(config.mode)
    return config
  }

  /**
   * Set theme and persist to storage
   */
  const setTheme = async (mode: ThemeMode) => {
    currentTheme.value = mode
    applyTheme(mode)
    await themeStorage.setTheme(mode)
  }

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = async () => {
    const newMode: ThemeMode = currentTheme.value === 'dark' ? 'light' : 'dark'
    await setTheme(newMode)
  }

  /**
   * Watch for theme changes (optional, for reactive side effects)
   */
  watch(currentTheme, newMode => {
    applyTheme(newMode)
  })

  return {
    currentTheme,
    initTheme,
    setTheme,
    toggleTheme,
  }
}
