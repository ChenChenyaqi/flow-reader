<template>
  <div class="mt-4">
    <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
      Difficult Words
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
          🇨🇳 {{ item.chineseTranslation }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { VocabularyItem } from '@/shared/types/llm'

defineProps<{
  items: VocabularyItem[]
}>()

const hoveredWord = ref('')
</script>
