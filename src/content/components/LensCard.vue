<template>
  <div
    v-if="visible"
    ref="cardRef"
    class="fixed z-[99998] w-[420px] shadow-2xl rounded-xl overflow-hidden ring-1 ring-border bg-card text-card-foreground select-none"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
    }"
    @mousedown="onMousedown"
  >
    <!-- Card Content -->
    <div class="flex flex-col h-auto max-h-[80vh]">
      <!-- Header: Logo & Close Button -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-border bg-card/95">
        <div class="flex items-center gap-2">
          <!-- Logo Icon -->
          <div
            class="w-5 h-5 bg-gradient-to-br from-accent to-purple-600 rounded-md flex items-center justify-center shadow-lg shadow-accent/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
              ></circle>
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
              ></line>
            </svg>
          </div>
          <span class="font-semibold text-sm tracking-wide">FluentLens</span>
        </div>

        <button
          class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition"
          title="Close"
          @click="$emit('close')"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
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

      <!-- Content Area -->
      <div class="overflow-y-auto max-h-[400px] p-5">
        <!-- Selected Text Display -->
        <div>
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Selected Text
          </h3>
          <div class="text-[15px] leading-relaxed text-slate-300 bg-slate-800/30 rounded p-3">
            {{ text }}
          </div>
        </div>

        <!-- Info Note -->
        <div class="mt-4 text-xs text-slate-500 italic">
          <p>This is a simplified version showing only the selected text.</p>
          <p class="mt-1">Full analysis features will be implemented in future versions.</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-3 bg-slate-800/50 border-t border-border flex justify-between items-center">
        <span class="text-[10px] text-slate-500">Drag to move • Click X to close</span>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span class="text-xs text-slate-400">Ready</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDraggable } from '../composables/useDraggable'

const props = defineProps<{
  position: { x: number; y: number }
  visible: boolean
  text: string
}>()

const emit = defineEmits<{
  close: []
  'update:position': [position: { x: number; y: number }]
}>()

const cardRef = ref<HTMLElement | null>(null)

// Setup draggable functionality
const { position: dragPosition, onMousedown } = useDraggable({
  elementRef: cardRef,
  initialPosition: props.position,
})

// Update parent when drag position changes
watch(dragPosition, newPosition => {
  emit('update:position', newPosition.value)
})
</script>

<style scoped>
/* No additional styles needed - using Tailwind classes */
</style>

