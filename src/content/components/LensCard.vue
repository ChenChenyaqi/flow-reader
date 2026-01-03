<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="showCard"
      ref="cardRef"
      class="fixed z-[999999] w-[400px] bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col"
      :style="{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }"
    >
      <!-- Card Header -->
      <div
        class="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 cursor-move"
        @mousedown="startDrag"
      >
        <div class="flex items-center gap-2">
          <!-- Back button when in config mode -->
          <button
            v-if="showConfig"
            @click.stop="showConfig = false"
            class="text-slate-400 hover:text-slate-200 transition"
            title="Back to Analysis"
          >
            <ChevronLeft :size="16" />
          </button>
          <div
            class="w-2 h-2 rounded-full"
            :class="showConfig ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'"
          ></div>
          <span class="font-bold text-slate-200 text-sm">{{
            showConfig ? 'Config Model' : 'FluentLens'
          }}</span>
        </div>
        <div class="flex items-center gap-2">
          <!-- Collapse Toggle (only when not in config mode) -->
          <button
            v-if="!showConfig"
            @click.stop="toggleCollapse"
            class="text-slate-400 hover:text-slate-200 transition"
            :title="isCollapsed ? 'Expand' : 'Collapse'"
          >
            <Minus
              v-if="!isCollapsed"
              :size="16"
            />
            <Plus
              v-else
              :size="16"
            />
          </button>
          <!-- Settings button (only when not in config mode) -->
          <button
            v-if="!showConfig"
            @click.stop="handleOpenConfig"
            class="text-slate-400 hover:text-slate-200 transition"
            title="Config Model"
          >
            <Settings :size="16" />
          </button>
          <!-- Close button (hidden when in config mode) -->
          <button
            v-if="!showConfig"
            @click.stop="handleClose"
            class="text-slate-400 hover:text-white transition"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

      <!-- No Config Warning -->
      <div
        v-if="!hasConfig && !isCollapsed && !showConfig"
        class="p-5"
      >
        <div class="bg-amber-950/30 border border-amber-900 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <div class="text-amber-400 mt-0.5">
              <AlertTriangle :size="16" />
            </div>
            <div>
              <p class="text-amber-200 text-sm font-medium">No Model Config</p>
              <p class="text-amber-300/70 text-xs mt-1">
                Please click the gear icon in the upper right corner to configure
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Config Form -->
      <div
        v-if="showConfig && !isCollapsed"
        class="space-y-4"
      >
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
            LLM Config
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
            Vocabulary
          </button>
        </div>

        <!-- LLM Config Panel -->
        <div
          v-if="configTab === ConfigTabType.LLM"
          class="px-5 pb-5 space-y-4"
        >
          <div>
            <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Provider
            </label>
            <select
              v-model="localConfig.provider"
              @change="handleProviderChange"
              class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="zhipu">智谱 AI (Zhipu)</option>
              <option value="openai">OpenAI</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              API Key
            </label>
            <input
              v-model="localConfig.apiKey"
              type="password"
              class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Input API Key"
            />
          </div>

          <div>
            <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Model Name
            </label>
            <input
              v-model="localConfig.model"
              class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Input Model Name"
            />
          </div>

          <div v-if="localConfig.provider === 'custom'">
            <label class="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              API URL
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
            <span>Config saved successfully!</span>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              @click="showConfig = false"
              class="flex-1 bg-slate-700 text-slate-200 py-2 rounded-lg hover:bg-slate-600 transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              @click="handleSaveConfig"
              class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              Save Config
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
      </div>

      <!-- Card Body (Analysis Content) -->
      <div
        v-else-if="!isCollapsed && !showConfig"
        class="p-5 max-h-[60vh] overflow-y-auto"
      >
        <!-- Simplified Version -->
        <div class="mb-4">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Simplified Version
          </div>

          <!-- Streaming: Show spinner + real-time text (typewriter effect) -->
          <div
            v-if="simplifyLoading && simplifiedText"
            class="flex items-start gap-2"
          >
            <Loader2
              class="animate-spin mt-1 flex-shrink-0"
              :size="16"
            />
            <p class="text-emerald-300 text-base leading-relaxed">
              {{ simplifiedText }}
            </p>
          </div>

          <!-- Loading before first chunk -->
          <div
            v-else-if="simplifyLoading"
            class="text-indigo-300 flex items-center gap-2"
          >
            <Loader2
              class="animate-spin"
              :size="16"
            />
            <span class="text-sm">Simplifying...</span>
          </div>

          <!-- Completed -->
          <div
            v-else-if="simplifiedText"
            class="text-emerald-300 text-base leading-relaxed"
            v-text="simplifiedText"
          ></div>

          <!-- Initial state -->
          <div
            v-else
            class="text-slate-500 text-sm italic"
          >
            Click below to simplify
          </div>
        </div>

        <!-- Original Text -->
        <div>
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Original Text
          </div>

          <!-- Grammar analysis loading -->
          <div
            v-if="grammarLoading && !grammarAnalysis"
            class="text-indigo-300 text-sm flex items-center gap-2 mb-2"
          >
            <Loader2
              class="animate-spin"
              :size="14"
            />
            <span>Analyzing grammar structure...</span>
          </div>

          <!-- Grammar legend -->
          <div
            v-if="grammarAnalysis"
            class="flex items-center gap-4 mb-2 text-xs"
          >
            <div class="flex items-center gap-1">
              <span class="border-b-2 border-blue-400 text-blue-400">Subject</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="border-b-2 border-amber-400 text-amber-400">Predicate</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="border-b-2 border-violet-400 text-violet-400">Object</span>
            </div>
          </div>

          <!-- Highlighted or plain text -->
          <div
            class="text-lg leading-relaxed font-serif bg-slate-800/50 p-3 rounded border-l-4 border-indigo-500"
          >
            <GrammarHighlight
              v-if="grammarAnalysis"
              :text="analyzingText"
              :analysis="grammarAnalysis"
            />
            <div
              v-else
              v-text="analyzingText"
              class="text-slate-400"
            ></div>
          </div>
        </div>

        <!-- Vocabulary Section -->
        <VocabularySection
          v-if="grammarAnalysis?.vocabulary.length"
          :items="grammarAnalysis.vocabulary"
        />

        <!-- Translation Section -->
        <TranslationSection
          v-if="grammarAnalysis?.translation"
          :translation="grammarAnalysis.translation"
        />

        <!-- Error State -->
        <div
          v-if="error"
          class="mt-4 bg-red-950/30 border border-red-900 rounded-lg p-3"
        >
          <p class="text-red-300 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Card Footer (only when not in config mode) -->
      <div
        v-if="!isCollapsed && !showConfig"
        class="px-4 py-3 bg-slate-950/50 border-t border-slate-800 text-xs text-slate-500 flex justify-between"
      >
        <span>Length: {{ analyzingText.length }} chars</span>
        <span
          v-if="hasConfig && !simplifyLoading"
          class="text-indigo-400 cursor-pointer hover:text-indigo-300"
          @click="handleSimplify"
        >
          {{ simplifiedText ? '重新生成' : '重新生成' }}
        </span>
        <span
          v-else-if="hasConfig"
          class="text-slate-600"
        >
          Analyzing...
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import {
  Minus,
  Plus,
  Settings,
  X,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  Check,
} from 'lucide-vue-next'
import { useLLM } from '../composables/useLLM'
import GrammarHighlight from './GrammarHighlight.vue'
import VocabularySection from './VocabularySection.vue'
import VocabularyLevelSelector from './VocabularyLevelSelector.vue'
import TranslationSection from './TranslationSection.vue'
import { storage } from '@/shared/services/storage'
import { LLMProvider } from '@/shared/types/llm'
import type { LLMConfig, SimplifyContext } from '@/shared/types/llm'

const props = defineProps<{
  showCard: boolean
  cardPosition: {
    x: number
    y: number
  }
  selectionText: string
  hasConfig: boolean
  triggerSimplify: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'configSaved'): void
}>()

// Config Tab 类型
enum ConfigTabType {
  LLM = 'LLM',
  VOCABULARY = 'VOCABULARY',
}

const {
  error,
  simplifiedText,
  simplifyLoading,
  simplify,
  reset,
  grammarAnalysis,
  grammarLoading,
  cancelPendingRequests,
} = useLLM()

// Config state
const showConfig = ref(false)
const configTab = ref<ConfigTabType>(ConfigTabType.LLM)
const modelConfig = ref<LLMConfig>({
  provider: LLMProvider.ZHIPU,
  apiKey: '',
  model: '',
})

// Local config for editing
const localConfig = ref<LLMConfig>({ ...modelConfig.value })
const configError = ref('')
const saveSuccess = ref(false)

// Load config when card opens
watch(
  () => props.showCard,
  async show => {
    if (show) {
      const config = await storage.getLLMConfig()
      if (config) {
        modelConfig.value = config
        localConfig.value = { ...config }
      }
    }
  },
  { immediate: true }
)

// Internal state: store the text being analyzed (doesn't change when user reselects)
const analyzingText = ref('')

// Card dimensions
const CARD_WIDTH = 400
const COLLAPSED_HEIGHT = 52 // Header height

// Card ref for getting actual dimensions
const cardRef = ref<HTMLElement | null>(null)

/**
 * Get actual card height from DOM
 */
function getCardHeight(): number {
  return cardRef.value?.offsetHeight || COLLAPSED_HEIGHT
}

/**
 * Clamp position to keep card within viewport
 */
function clampPosition(x: number, y: number): { x: number; y: number } {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const cardHeight = getCardHeight()

  return {
    x: Math.max(0, Math.min(x, viewportWidth - CARD_WIDTH)),
    y: Math.max(0, Math.min(y, viewportHeight - cardHeight)),
  }
}

// Draggable state
const position = ref(clampPosition(props.cardPosition.x, props.cardPosition.y))
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// Collapse state
const isCollapsed = ref(false)

/**
 * Toggle collapse state with boundary check
 */
async function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value

  // Wait for DOM to update after expand
  await nextTick()

  // Check if expanding would go out of bounds
  const viewportHeight = window.innerHeight
  const cardHeight = getCardHeight()
  const bottomEdge = position.value.y + cardHeight

  if (bottomEdge > viewportHeight) {
    // Move card up to fit
    position.value = clampPosition(position.value.x, position.value.y)
  }
}

// Sync position with props
watch(
  () => props.cardPosition,
  newPos => {
    if (!isDragging.value) {
      position.value = { x: newPos.x, y: newPos.y }
    }
  },
  { deep: true }
)

// Track if card was just opened to trigger auto-simplify
const wasCardOpen = ref(false)

// Auto-simplify when card opens
watch(
  [() => props.showCard, () => props.selectionText],
  ([showCard, newSelectionText], [prevShowCard]) => {
    // Trigger simplify when card opens
    if (showCard && !prevShowCard && props.hasConfig && newSelectionText) {
      // Save the text being analyzed
      analyzingText.value = newSelectionText
      nextTick(() => {
        handleSimplify()
      })
    }

    // Update tracking state
    wasCardOpen.value = showCard
  }
)

// Trigger re-analysis when triggerSimplify changes (user clicked icon while card is open)
watch(
  () => props.triggerSimplify,
  (newVal, oldVal) => {
    if (newVal > oldVal && props.showCard && props.selectionText && props.hasConfig) {
      // Save the new text being analyzed
      analyzingText.value = props.selectionText
      reset()
      nextTick(() => {
        handleSimplify()
      })
    }
  }
)

/**
 * Start dragging
 */
function startDrag(event: MouseEvent) {
  isDragging.value = true
  dragOffset.value = {
    x: event.clientX - position.value.x,
    y: event.clientY - position.value.y,
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

/**
 * Handle dragging with boundary checking
 */
function onDrag(event: MouseEvent) {
  if (!isDragging.value) return

  const newX = event.clientX - dragOffset.value.x
  const newY = event.clientY - dragOffset.value.y

  position.value = clampPosition(newX, newY)
}

/**
 * Stop dragging
 */
function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

/**
 * Get page context for better simplification
 */
function getPageContext(): SimplifyContext {
  return {
    pageUrl: window.location.href,
    pageTitle: document.title,
    pageDescription:
      document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
  }
}

/**
 * Handle close - reset state before closing
 */
function handleClose() {
  cancelPendingRequests()
  reset()
  isCollapsed.value = false
  emit('close')
}

const handleSimplify = () => {
  // Cancel any pending requests before starting new one
  cancelPendingRequests()

  // Reset state before re-analyzing
  reset()
  const context = getPageContext()
  simplify(analyzingText.value, context, {
    stream: true,
  })
}

// Clean up on unmount - cancel any pending requests
onUnmounted(() => {
  cancelPendingRequests()
})

/**
 * Handle open config - switch to config mode
 */
function handleOpenConfig() {
  showConfig.value = true
}

/**
 * Handle provider change - reset fields when provider changes
 */
function handleProviderChange() {
  if (localConfig.value.provider !== modelConfig.value.provider) {
    // Provider changed - clear fields
    localConfig.value.apiKey = ''
    localConfig.value.apiUrl = ''
    localConfig.value.model = ''
  } else {
    // Reverted to original - restore config
    localConfig.value = { ...modelConfig.value }
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

  // Save to storage
  try {
    await storage.setLLMConfig({ ...localConfig.value })
    modelConfig.value = { ...localConfig.value }
    saveSuccess.value = true

    // Notify parent and exit config mode after a short delay
    setTimeout(() => {
      emit('configSaved')
      showConfig.value = false
      saveSuccess.value = false
    }, 1000)
  } catch (err) {
    configError.value = err instanceof Error ? err.message : 'Failed to save config'
  }
}
</script>

<style scoped></style>
