<template>
  <div class="p-5 max-h-[60vh] overflow-y-auto">
    <!-- Simplified Version -->
    <div class="mb-4">
      <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {{ $t('card.simplified') }}
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
        <span class="text-sm">{{ $t('card.analyzing') }}</span>
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
        {{ $t('card.analyzing') }}
      </div>
    </div>

    <!-- Original Text -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {{ $t('card.grammar') }}
        </div>
        <!-- Confidence badge -->
        <div
          v-if="grammarAnalysis?.confidence"
          class="text-xs px-2 py-0.5 rounded font-medium"
          :class="{
            'bg-emerald-900/50 text-emerald-400': grammarAnalysis.confidence.level === 'high',
            'bg-amber-900/50 text-amber-400': grammarAnalysis.confidence.level === 'medium',
            'bg-red-900/50 text-red-400': grammarAnalysis.confidence.level === 'low',
          }"
        >
          {{ `${$t('card.confidence')} ${grammarAnalysis.confidence.score}` }}%
        </div>
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
        <span>{{ $t('card.analyzing') }}</span>
      </div>

      <!-- Grammar legend -->
      <div
        v-if="grammarAnalysis"
        class="flex items-center gap-4 mb-2 text-xs"
      >
        <div class="flex items-center gap-1">
          <span class="border-b-2 border-blue-400 text-blue-400">{{ $t('grammar.subject') }}</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="border-b-2 border-amber-400 text-amber-400">{{
            $t('grammar.predicate')
          }}</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="border-b-2 border-violet-400 text-violet-400">{{
            $t('grammar.object')
          }}</span>
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
</template>

<script setup lang="ts">
import { nextTick, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { SimplifyContext } from '@/shared/types/llm'
import GrammarHighlight from './GrammarHighlight.vue'
import VocabularySection from './VocabularySection.vue'
import TranslationSection from './TranslationSection.vue'
import { useLLM } from '../../composables/useLLM'

const props = defineProps<{
  analyzingText: string
}>()
const anaysising = defineModel<boolean>()

const {
  error,
  simplifiedText,
  simplifyLoading,
  simplify,
  analyzeGrammar,
  reset,
  grammarAnalysis,
  grammarLoading,
} = useLLM()

watch([() => simplifyLoading.value, () => grammarLoading.value], loadings => {
  if (loadings.some(i => i)) {
    anaysising.value = true
  } else {
    anaysising.value = false
  }
})

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

const handleSimplify = () => {
  cancelAnalysis()
  const context = getPageContext()
  simplify(props.analyzingText, context, {
    stream: true,
  })
  analyzeGrammar(props.analyzingText, context)
}

const cancelAnalysis = () => {
  reset()
}

defineExpose({
  startAnalysis: () => {
    reset()
    nextTick(() => {
      handleSimplify()
    })
  },
  cancelAnalysis,
})
</script>

<style scoped></style>
