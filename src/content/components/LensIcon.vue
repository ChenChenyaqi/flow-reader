<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-75"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-75"
  >
    <button
      v-if="showIcon"
      @mousedown.stop.prevent="$emit('click')"
      class="fixed z-[999999] group flex items-center justify-center w-8 h-8 bg-slate-900 hover:bg-indigo-600 rounded-lg shadow-lg cursor-pointer transition-colors border border-slate-700/50"
      :style="{
        left: `${iconPosition.x}px`,
        top: `${iconPosition.y}px`,
      }"
    >
      <Search
        :size="20"
        class="text-white"
      />
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'

defineProps<{
  showIcon: boolean
  iconPosition: {
    x: number
    y: number
  }
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped></style>
