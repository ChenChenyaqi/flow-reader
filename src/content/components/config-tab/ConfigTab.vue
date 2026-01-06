<template>
  <div class="space-y-4">
    <!-- Tab Menu -->
    <div class="flex gap-1 px-5 pt-5">
      <button
        @click="configTab = ConfigTabType.LLM"
        class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
        :class="
          configTab === ConfigTabType.LLM
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        "
      >
        {{ $t('config.llmConfig') }}
      </button>
      <button
        @click="configTab = ConfigTabType.VOCABULARY"
        class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
        :class="
          configTab === ConfigTabType.VOCABULARY
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        "
      >
        {{ $t('config.vocabulary') }}
      </button>
      <button
        @click="configTab = ConfigTabType.OTHER"
        class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
        :class="
          configTab === ConfigTabType.OTHER
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        "
      >
        {{ $t('config.other') }}
      </button>
    </div>

    <!-- LLM Config Panel -->
    <div
      v-if="configTab === ConfigTabType.LLM"
      class="px-5 pb-5 space-y-4"
    >
      <div>
        <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          {{ $t('config.provider') }}
        </label>
        <select
          v-model="localConfig.provider"
          @change="handleProviderChange"
          class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="zhipu">{{ $t('provider.zhipu') }}</option>
          <!-- <option value="doubao">{{ $t('provider.doubao') }}</option> -->
          <option value="qianwen">{{ $t('provider.qianwen') }}</option>
          <option value="deepseek">{{ $t('provider.deepseek') }}</option>
          <!-- <option value="moonshot">{{ $t('provider.moonshot') }}</option> -->
          <option value="openai">{{ $t('provider.openai') }}</option>
          <option value="custom">{{ $t('provider.custom') }}</option>
          <!-- <option value="groq">{{ $t('provider.groq') }}</option> -->
        </select>
      </div>

      <div>
        <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          {{ $t('config.apiKey') }}
        </label>
        <input
          v-model="localConfig.apiKey"
          type="password"
          class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :placeholder="$t('config.apiKey')"
        />
      </div>

      <div>
        <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          {{ $t('config.model') }}
        </label>
        <input
          v-model="localConfig.model"
          class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :placeholder="$t('config.model')"
        />
      </div>

      <div v-if="localConfig.provider === 'custom'">
        <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          {{ $t('config.apiUrl') }}
        </label>
        <input
          v-model="localConfig.apiUrl"
          type="url"
          class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="https://api.example.com/v1/chat/completions"
        />
      </div>

      <div
        v-if="configError"
        class="text-red-400 text-sm bg-red-950/30 border border-red-900 rounded-lg p-3"
      >
        {{ configError }}
      </div>

      <div
        v-if="saveSuccess"
        class="text-emerald-400 text-sm bg-emerald-950/30 border border-emerald-900 rounded-lg p-3 flex items-center gap-2"
      >
        <Check :size="16" />
        <span>{{ $t('config.configSaved') }}</span>
      </div>

      <div class="flex gap-2 pt-2">
        <button
          @click="$emit('close')"
          class="flex-1 bg-slate-700 text-slate-200 py-2 rounded-lg hover:bg-slate-600 transition text-sm font-medium"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          @click="handleSaveConfig"
          class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          {{ $t('config.saveConfig') }}
        </button>
      </div>
    </div>

    <!-- Vocabulary Config Panel -->
    <div
      v-else-if="configTab === ConfigTabType.VOCABULARY"
      class="px-5 pb-5"
    >
      <VocabularyLevelSelector />
    </div>

    <!-- Other Config Panel -->
    <div
      v-else-if="configTab === ConfigTabType.OTHER"
      class="px-5 pb-5"
    >
      <LanguageSwitcher />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Check } from 'lucide-vue-next'
import LanguageSwitcher from './LanguageSwitcher.vue'
import VocabularyLevelSelector from './VocabularyLevelSelector.vue'
import { LLMConfig, LLMProvider } from '@/shared/types/llm'
import { storage } from '@/shared/services/storage'

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'close'): void
}>()
// Config Tab Type
enum ConfigTabType {
  LLM = 'LLM',
  VOCABULARY = 'VOCABULARY',
  OTHER = 'OTHER',
}

const configTab = ref<ConfigTabType>(ConfigTabType.LLM)
const allConfigs = ref<Partial<Record<LLMProvider, LLMConfig>>>({})
// Multi-config storage
const currentProvider = ref<LLMProvider>(LLMProvider.ZHIPU)
// Local config for editing (bound to form)
const localConfig = ref<LLMConfig>({
  provider: currentProvider.value,
  apiKey: '',
  model: '',
})
const configError = ref('')
const saveSuccess = ref(false)

onMounted(async () => {
  // Reload multi-config to get current state
  const multiConfig = await storage.getMultiLLMConfig()
  allConfigs.value = multiConfig.configs
  currentProvider.value = multiConfig.currentProvider

  // Reset localConfig to current provider's config
  const savedConfig = allConfigs.value[currentProvider.value]
  localConfig.value = savedConfig
    ? { ...savedConfig }
    : {
        provider: currentProvider.value,
        apiKey: '',
        model: '',
        apiUrl: '',
      }

  // Clear errors and success messages
  configError.value = ''
  saveSuccess.value = false
})

/**
 * Handle provider change - load saved config or clear fields
 */
function handleProviderChange() {
  const newProvider = localConfig.value.provider
  const savedConfig = allConfigs.value[newProvider]

  if (savedConfig) {
    // Has saved config, load it
    localConfig.value = { ...savedConfig }
  } else {
    // No saved config, clear fields (keep provider)
    localConfig.value = {
      provider: newProvider,
      apiKey: '',
      model: '',
      apiUrl: '',
    }
  }

  configError.value = ''
  saveSuccess.value = false
}

/**
 * Handle save config - validate and save to storage
 */
async function handleSaveConfig() {
  configError.value = ''
  saveSuccess.value = false

  // Validation
  if (!localConfig.value.apiKey || localConfig.value.apiKey.trim() === '') {
    configError.value = 'API Key Required'
    return
  }

  if (!localConfig.value.model || localConfig.value.model.trim() === '') {
    configError.value = 'Model Name Required'
    return
  }

  if (localConfig.value.provider === LLMProvider.CUSTOM && !localConfig.value.apiUrl) {
    configError.value = 'Need API URL'
    return
  }

  // Save to multi-config storage
  try {
    const provider = localConfig.value.provider

    // Update allConfigs and set as current provider
    allConfigs.value[provider] = { ...localConfig.value }
    currentProvider.value = provider

    // Save to storage
    await storage.setLLMConfig({ ...localConfig.value })
    saveSuccess.value = true

    // Notify parent and exit config mode after a short delay
    setTimeout(() => {
      emit('saved')
      saveSuccess.value = false
    }, 1000)
  } catch (err) {
    configError.value = err instanceof Error ? err.message : 'Failed to save config'
  }
}
</script>

<style scoped></style>
