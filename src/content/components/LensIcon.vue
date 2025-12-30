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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-white"
      >
        <path d="M21 21l-4.35-4.35" />
        <path d="M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" />
        <path d="M11 8l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
      </svg>
    </button>
  </Transition>
</template>

<script setup lang="ts">
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
