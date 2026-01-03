import type { LLMConfig } from '@/shared/types/llm'

class StorageService {
  private readonly LLM_CONFIG_KEY = 'fluent_read_llm_config'

  async getLLMConfig(): Promise<LLMConfig | null> {
    const result = await chrome.storage.local.get(this.LLM_CONFIG_KEY)
    return result[this.LLM_CONFIG_KEY] || null
  }

  async setLLMConfig(config: LLMConfig): Promise<void> {
    if (!this.validateConfig(config)) {
      throw new Error('Invalid LLM configuration')
    }
    await chrome.storage.local.set({
      [this.LLM_CONFIG_KEY]: config,
    })
  }

  async hasLLMConfig(): Promise<boolean> {
    const config = await this.getLLMConfig()
    return config !== null && config.apiKey !== ''
  }

  async clearLLMConfig(): Promise<void> {
    await chrome.storage.local.remove(this.LLM_CONFIG_KEY)
  }

  validateConfig(config: LLMConfig): boolean {
    if (!config.apiKey || config.apiKey.trim() === '') {
      return false
    }
    if (!config.model || config.model.trim() === '') {
      return false
    }
    if (config.provider === 'custom' && !config.apiUrl) {
      return false
    }
    return true
  }
}

export const storage = new StorageService()
