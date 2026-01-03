<template>
  <div>
    <div class="text-sm font-semibold text-slate-300 mb-3">
      {{ $t('config.vocabularyLevel') }}
    </div>

    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="level in Object.values(VocabularyLevel)"
        :key="level"
        class="px-3 py-2 text-xs rounded transition-colors"
        :class="
          currentLevel === level
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        "
        @click="selectLevel(level as VocabularyLevel)"
      >
        <div class="font-semibold">{{ getLevelLabel(level) }}</div>
        <div class="opacity-75">{{ getLevelCefr(level) }}</div>
      </button>
    </div>

    <!-- Statistical information -->
    <div
      v-if="stats"
      class="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400"
    >
      <div class="flex justify-between">
        <span>{{ $t('card.know') }}: {{ stats.knownCount }}</span>
        <span>{{ $t('card.dontKnow') }}: {{ stats.unknownCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { VocabularyLevel } from '@/shared/types/vocabulary'
import { vocabularyState } from '@/shared/services/vocabularyState'

const { t } = useI18n()
const currentLevel = ref<VocabularyLevel>(VocabularyLevel.LEVEL_2000)

const stats = computed(() => vocabularyState.getStats())

onMounted(async () => {
  if (!vocabularyState.initialized) {
    await vocabularyState.init()
  }
  currentLevel.value = vocabularyState.level
})

async function selectLevel(level: VocabularyLevel) {
  currentLevel.value = level
  await vocabularyState.updateLevel(level)
}

// Get vocabulary level label from i18n
function getLevelLabel(level: VocabularyLevel): string {
  const key = `vocabularyLevel.${level}`
  return t(key)
}

// Get CEFR level (static mapping)
function getLevelCefr(level: VocabularyLevel): string {
  const cefrMap: Record<VocabularyLevel, string> = {
    [VocabularyLevel.LEVEL_500]: 'A1',
    [VocabularyLevel.LEVEL_1000]: 'A2',
    [VocabularyLevel.LEVEL_2000]: 'B1',
    [VocabularyLevel.LEVEL_3000]: 'B2',
    [VocabularyLevel.LEVEL_5000]: 'C1',
    [VocabularyLevel.LEVEL_8000]: 'C2',
  }
  return cefrMap[level] || ''
}
</script>
