import { vi } from 'vitest'

/**
 * Mock Vue lifecycle hooks to prevent warnings when using composables outside of components.
 * This allows us to test composables directly without needing to wrap them in a component.
 */
vi.mock('vue', async importOriginal => {
  const actual = await importOriginal<typeof import('vue')>()

  return {
    ...actual,
    onMounted: (_fn: () => void) => {
      // Silently ignore onMounted calls in tests
      _fn()
    },
    onUnmounted: (_fn: () => void) => {
      // Silently ignore onUnmounted calls in tests
      // Tests can manually call cleanup() if needed
    },
  }
})
