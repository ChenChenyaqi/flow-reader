<template>
  <div class="mt-4">
    <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
      Difficult Words ({{ items.length }})
    </div>

    <div
      v-if="items.length === 0"
      class="text-slate-600 text-sm italic"
    >
      No difficult words found
    </div>

    <div
      v-else
      class="space-y-2"
    >
      <div
        v-for="item in items"
        :key="item.word"
        class="bg-slate-800/50 rounded p-3"
      >
        <div class="font-semibold text-slate-200 mb-1">{{ item.word }}</div>
        <p class="text-slate-400 text-sm mb-2">{{ item.simpleDefinition }}</p>
        <p
          class="text-sm transition-all duration-300 cursor-default"
          :class="
            hoveredWord === item.word ? 'text-slate-200' : 'text-slate-600 blur-sm select-none'
          "
          @mouseenter="hoveredWord = item.word"
          @mouseleave="hoveredWord = ''"
        >
          {{ item.chineseTranslation }}
        </p>

        <!-- 认识/不认识按钮 -->
        <div class="flex gap-2 mt-3">
          <button
            class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
            :class="
              markedWords[item.word] === 'known'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-green-600 hover:text-white'
            "
            @click="markAsKnown(item.word)"
          >
            ✓ 认识
          </button>
          <button
            class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
            :class="
              markedWords[item.word] === 'unknown'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-red-600 hover:text-white'
            "
            @click="markAsUnknown(item.word)"
          >
            ✗ 不认识
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { VocabularyItem } from '@/shared/types/llm'
import { vocabularyState } from '@/shared/services/vocabularyState'
import { WordMasteryStatus } from '@/shared/types/vocabulary'

defineProps<{
  items: VocabularyItem[]
}>()

const hoveredWord = ref('')
const markedWords = ref<Record<string, 'known' | 'unknown'>>({})

async function markAsKnown(word: string) {
  await vocabularyState.markWord(word, WordMasteryStatus.KNOWN)
  markedWords.value[word] = 'known'
}

async function markAsUnknown(word: string) {
  await vocabularyState.markWord(word, WordMasteryStatus.UNKNOWN)
  markedWords.value[word] = 'unknown'
}
</script>
