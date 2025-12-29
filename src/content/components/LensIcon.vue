<template>
  <div
    v-if="visible"
    class="fixed z-[99999] cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
    :style="{
      left: `${position.x + 12}px`,
      top: `${position.y - 6}px`,
    }"
    @click="handleClick"
  >
    <!-- Lens Icon -->
    <div
      class="w-6 h-6 bg-blue-500 bg-gradient-to-br from-accent to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-accent/30 ring-2 ring-white/20"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
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
  </div>
</template>

<script setup lang="ts">
defineProps<{
  position: { x: number; y: number }
  visible: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>
