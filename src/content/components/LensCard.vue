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
      class="fixed z-[999999] w-[400px] bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col"
      :style="{
        left: `${cardPosition.x}px`,
        top: `${cardPosition.y}px`,
      }"
    >
      <!-- Card Header -->
      <div
        class="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800"
      >
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span class="font-bold text-slate-200 text-sm">FluentLens</span>
        </div>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-white transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
            ></line>
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
            ></line>
          </svg>
        </button>
      </div>

      <!-- Card Body -->
      <div class="p-5 max-h-[60vh] overflow-y-auto">
        <div class="mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Selected Content
        </div>

        <!-- display selection text -->
        <div
          class="text-slate-300 text-lg leading-relaxed font-serif bg-slate-800/50 p-3 rounded border-l-4 border-indigo-500"
        >
          {{ selectionText }}
        </div>
      </div>

      <!-- Card Footer (Placeholder) -->
      <div
        class="px-4 py-3 bg-slate-950/50 border-t border-slate-800 text-xs text-slate-500 flex justify-between"
      >
        <span>Length: {{ selectionText.length }} chars</span>
        <span class="text-indigo-400">Analysis Pending...</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  showCard: boolean
  cardPosition: {
    x: number
    y: number
  }
  selectionText: string
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped></style>
