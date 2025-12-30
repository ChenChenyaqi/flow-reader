<template>
  <div class="fluent-lens-container text-base font-sans antialiased text-slate-800">
    <LensIcon
      :show-icon="showIcon"
      :icon-position="iconPosition"
      @click="handleIconClick"
    />
    <LensCard
      :show-card="showCard"
      :card-position="cardPosition"
      :selection-text="selectionText"
      @close="closeCard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import LensIcon from './components/LensIcon.vue'
import LensCard from './components/LensCard.vue'
import { useSelection } from './composables/useSelection'
import { usePosition } from './composables/usePosition'
import { useClickOutside } from './composables/useClickOutside'

// --- Composables ---
const { selectionText, clearSelection, handleMouseUp } = useSelection()
const { iconPosition, cardPosition, setIconPosition, setCardPosition } = usePosition()

// --- UI State ---
const showIcon = ref(false)
const showCard = ref(false)

// --- Event Handlers ---
const onSelectionMouseUp = () => {
  if (showCard.value) return // no handle selection when card visible

  handleMouseUp(data => {
    setIconPosition(data.rect)
    showIcon.value = true
  })
}

useClickOutside('fluent-lens-host', () => {
  showIcon.value = false
})

const handleIconClick = () => {
  showIcon.value = false
  setCardPosition(iconPosition.value)
  showCard.value = true
}

const closeCard = () => {
  showCard.value = false
  clearSelection()
}

// --- Lifecycle ---
onMounted(() => {
  document.addEventListener('mouseup', onSelectionMouseUp)
})
onUnmounted(() => {
  document.removeEventListener('mouseup', onSelectionMouseUp)
})
</script>
