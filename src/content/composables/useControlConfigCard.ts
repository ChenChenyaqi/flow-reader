import { ref } from 'vue'
import { storage } from '@/shared/services/storage'
import { LLMProvider, type LLMConfig } from '@/shared/types/llm'

export default function useControlConfigCard() {
  const showConfig = ref(false)
  const hasConfig = ref(false)
  const modelConfig = ref<LLMConfig>({ provider: LLMProvider.ZHIPU, model: '', apiKey: '' })

  const loadConfig = async () => {
    hasConfig.value = await storage.hasLLMConfig()
    if (hasConfig.value) {
      const config = await storage.getLLMConfig()
      if (config) {
        modelConfig.value = config
      }
    }
  }

  const handleOpenConfig = () => {
    showConfig.value = true
    loadConfig()
  }

  const handleCloseConfig = () => {
    showConfig.value = false
  }

  const handleSaveConfig = async (config: LLMConfig) => {
    try {
      await storage.setLLMConfig(config)
      showConfig.value = false
      await loadConfig()
    } catch (e) {
      console.error('save model config error: ', e)
    }
  }

  return {
    showConfig,
    hasConfig,
    modelConfig,
    loadConfig,
    handleOpenConfig,
    handleCloseConfig,
    handleSaveConfig,
  }
}
