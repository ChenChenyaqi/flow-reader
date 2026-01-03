<template>
  <div>
    <div class="text-sm font-semibold text-slate-300 mb-3">
      Your Vocabulary Level
    </div>

    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="(info, level) in VOCABULARY_LEVEL_INFO"
        :key="level"
        class="px-3 py-2 text-xs rounded transition-colors"
        :class="
          currentLevel === level
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        "
        @click="selectLevel(level as VocabularyLevel)"
      >
        <div class="font-semibold">{{ info.label }}</div>
        <div class="opacity-75">{{ info.cefr }}</div>
      </button>
    </div>

    <!-- 统计信息 -->
    <div
      v-if="stats"
      class="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400"
    >
      <div class="flex justify-between">
        <span>已认识: {{ stats.knownCount }}</span>
        <span>学习中: {{ stats.unknownCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { VOCABULARY_LEVEL_INFO } from '@/shared/types/vocabulary'
import { VocabularyLevel } from '@/shared/types/vocabulary'
import { vocabularyState } from '@/shared/services/vocabularyState'

const currentLevel = ref<VocabularyLevel>(VocabularyLevel.LEVEL_2000)

// 直接从全局状态获取统计数据（computed 自动响应）
const stats = computed(() => vocabularyState.getStats())

onMounted(async () => {
  // 确保已初始化
  if (!vocabularyState.initialized) {
    await vocabularyState.init()
  }
  currentLevel.value = vocabularyState.level
})

async function selectLevel(level: VocabularyLevel) {
  currentLevel.value = level
  await vocabularyState.updateLevel(level)
}
</script>
