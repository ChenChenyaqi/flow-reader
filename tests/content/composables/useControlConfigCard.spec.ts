import { describe, it, expect, vi, beforeEach } from 'vitest'
import useControlConfigCard from '@/content/composables/useControlConfigCard'
import { storage } from '@/shared/services/storage'
import { LLMProvider } from '@/shared/types/llm'

// Mock the storage module
vi.mock('@/shared/services/storage', () => ({
  storage: {
    hasLLMConfig: vi.fn(),
    getLLMConfig: vi.fn(),
    setLLMConfig: vi.fn(),
  },
}))

describe('useControlConfigCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have showConfig as false', () => {
      const { showConfig } = useControlConfigCard()
      expect(showConfig.value).toBe(false)
    })

    it('should have hasConfig as false', () => {
      const { hasConfig } = useControlConfigCard()
      expect(hasConfig.value).toBe(false)
    })

    it('should have default modelConfig', () => {
      const { modelConfig } = useControlConfigCard()
      expect(modelConfig.value).toEqual({
        provider: LLMProvider.ZHIPU,
        model: '',
        apiKey: '',
      })
    })
  })

  describe('handleOpenConfig', () => {
    it('should set showConfig to true', async () => {
      vi.mocked(storage.hasLLMConfig).mockResolvedValue(false)

      const { showConfig, handleOpenConfig } = useControlConfigCard()

      handleOpenConfig()
      // loadConfig is not awaited, so showConfig is set immediately
      expect(showConfig.value).toBe(true)

      // Wait for the async loadConfig to complete
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('should load config when opening', async () => {
      vi.mocked(storage.hasLLMConfig).mockResolvedValue(true)
      vi.mocked(storage.getLLMConfig).mockResolvedValue({
        provider: LLMProvider.OPENAI,
        model: 'gpt-4',
        apiKey: 'sk-test',
      })

      const { handleOpenConfig, hasConfig, modelConfig, showConfig } = useControlConfigCard()

      handleOpenConfig()
      expect(showConfig.value).toBe(true)

      // Wait for loadConfig promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(storage.hasLLMConfig).toHaveBeenCalled()
      expect(hasConfig.value).toBe(true)
      expect(modelConfig.value).toEqual({
        provider: LLMProvider.OPENAI,
        model: 'gpt-4',
        apiKey: 'sk-test',
      })
    })

    it('should handle when no config exists', async () => {
      vi.mocked(storage.hasLLMConfig).mockResolvedValue(false)

      const { handleOpenConfig, hasConfig, modelConfig } = useControlConfigCard()

      handleOpenConfig()

      // Wait for loadConfig promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(hasConfig.value).toBe(false)
      expect(storage.getLLMConfig).not.toHaveBeenCalled()
      expect(modelConfig.value).toEqual({
        provider: LLMProvider.ZHIPU,
        model: '',
        apiKey: '',
      })
    })
  })

  describe('handleCloseConfig', () => {
    it('should set showConfig to false', () => {
      const { showConfig, handleCloseConfig } = useControlConfigCard()

      showConfig.value = true
      handleCloseConfig()

      expect(showConfig.value).toBe(false)
    })
  })

  describe('handleSaveConfig', () => {
    it('should save config and close dialog', async () => {
      vi.mocked(storage.setLLMConfig).mockResolvedValue()
      vi.mocked(storage.hasLLMConfig).mockResolvedValue(true)
      vi.mocked(storage.getLLMConfig).mockResolvedValue({
        provider: LLMProvider.CUSTOM,
        model: 'custom-model',
        apiKey: 'custom-key',
        apiUrl: 'https://api.example.com',
      })

      const { showConfig, handleSaveConfig } = useControlConfigCard()

      const newConfig = {
        provider: LLMProvider.CUSTOM,
        model: 'custom-model',
        apiKey: 'custom-key',
        apiUrl: 'https://api.example.com',
      }

      await handleSaveConfig(newConfig)

      expect(storage.setLLMConfig).toHaveBeenCalledWith(newConfig)
      expect(showConfig.value).toBe(false)
    })

    it('should reload config after saving', async () => {
      vi.mocked(storage.setLLMConfig).mockResolvedValue()
      vi.mocked(storage.hasLLMConfig).mockResolvedValue(true)
      vi.mocked(storage.getLLMConfig).mockResolvedValue({
        provider: LLMProvider.ZHIPU,
        model: 'glm-4',
        apiKey: 'zhipu-key',
      })

      const { handleSaveConfig, modelConfig } = useControlConfigCard()

      const newConfig = {
        provider: LLMProvider.ZHIPU,
        model: 'glm-4',
        apiKey: 'zhipu-key',
      }

      await handleSaveConfig(newConfig)

      expect(storage.hasLLMConfig).toHaveBeenCalled()
      expect(storage.getLLMConfig).toHaveBeenCalled()
      expect(modelConfig.value).toEqual({
        provider: LLMProvider.ZHIPU,
        model: 'glm-4',
        apiKey: 'zhipu-key',
      })
    })

    it('should handle save errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(storage.setLLMConfig).mockRejectedValue(new Error('Storage error'))

      const { showConfig, handleSaveConfig } = useControlConfigCard()

      // Open config first so showConfig is true
      showConfig.value = true

      const newConfig = {
        provider: LLMProvider.OPENAI,
        model: 'gpt-4',
        apiKey: 'sk-test',
      }

      await handleSaveConfig(newConfig)

      expect(consoleErrorSpy).toHaveBeenCalledWith('save model config error: ', expect.any(Error))
      // showConfig should remain true because error happens before showConfig.value = false
      expect(showConfig.value).toBe(true)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('loadConfig', () => {
    it('should load existing config', async () => {
      vi.mocked(storage.hasLLMConfig).mockResolvedValue(true)
      vi.mocked(storage.getLLMConfig).mockResolvedValue({
        provider: LLMProvider.OPENAI,
        model: 'gpt-3.5-turbo',
        apiKey: 'sk-123',
      })

      const { loadConfig, hasConfig, modelConfig } = useControlConfigCard()

      await loadConfig()

      expect(hasConfig.value).toBe(true)
      expect(modelConfig.value).toEqual({
        provider: LLMProvider.OPENAI,
        model: 'gpt-3.5-turbo',
        apiKey: 'sk-123',
      })
    })

    it('should handle missing config', async () => {
      vi.mocked(storage.hasLLMConfig).mockResolvedValue(true)
      vi.mocked(storage.getLLMConfig).mockResolvedValue(null)

      const { loadConfig, hasConfig, modelConfig } = useControlConfigCard()

      await loadConfig()

      expect(hasConfig.value).toBe(true)
      expect(modelConfig.value).toEqual({
        provider: LLMProvider.ZHIPU,
        model: '',
        apiKey: '',
      })
    })
  })
})
