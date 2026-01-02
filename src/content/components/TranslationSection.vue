<template>
  <div class="mt-4">
    <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Translation</div>

    <p
      v-if="translation"
      class="text-slate-400 leading-relaxed transition-all duration-300 cursor-default"
      :class="isHovered ? 'text-slate-200' : 'blur-sm select-none'"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      {{ translation }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  translation: string
}>()

const isHovered = ref(false)
</script>
