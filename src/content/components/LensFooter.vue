<template>
  <div
    class="px-4 py-3 bg-slate-950/50 border-t border-slate-800 text-xs text-slate-500 flex justify-between"
  >
    <span> {{ $t('card.length', { count: analyzingText.length }) }}</span>
    <span
      v-if="hasConfig && !analysising"
      class="text-indigo-400 cursor-pointer hover:text-indigo-300"
      @click="$emit('analysis')"
    >
      {{ $t('card.regenerate') }}
    </span>
    <span
      v-else-if="hasConfig"
      class="text-slate-600"
    >
      {{ $t('card.analyzing') }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ analyzingText: string; analysising: boolean; hasConfig: boolean }>()
defineEmits<{
  (e: 'analysis'): void
}>()
</script>

<style scoped></style>
