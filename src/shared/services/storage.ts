import type { LLMConfig, MultiLLMConfig, LLMProvider } from '@/shared/types/llm'

class StorageService {
  private readonly LLM_CONFIG_KEY = 'fluent_read_llm_config'

  private getDefaultMultiConfig(): MultiLLMConfig {
    return {
      currentProvider: 'zhipu' as LLMProvider,
      configs: {},
    }
  }

  async getLLMConfig(): Promise<LLMConfig | null> {
    const result = await chrome.storage.local.get(this.LLM_CONFIG_KEY)
    const multiConfig = result[this.LLM_CONFIG_KEY] as MultiLLMConfig | undefined

    if (!multiConfig) {
      return null
    }

    // Return the current provider's config
    return multiConfig.configs[multiConfig.currentProvider] || null
  }

  async getMultiLLMConfig(): Promise<MultiLLMConfig> {
    const result = await chrome.storage.local.get(this.LLM_CONFIG_KEY)
    return result[this.LLM_CONFIG_KEY] || this.getDefaultMultiConfig()
  }

  async setLLMConfig(config: LLMConfig): Promise<void> {
    if (!this.validateConfig(config)) {
      throw new Error('Invalid LLM configuration')
    }

    const multiConfig = await this.getMultiLLMConfig()
    multiConfig.currentProvider = config.provider
    multiConfig.configs[config.provider] = config

    await chrome.storage.local.set({
      [this.LLM_CONFIG_KEY]: multiConfig,
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
