<template>
  <!-- Root container - will be mounted in Shadow DOM -->
  <div class="fluent-lens-overlay">
    <!-- Lens Icon (appears next to selected text) -->
    <LensIcon
      :position="lensPosition"
      :visible="lensVisible"
      @click="handleIconClick"
    />

    <!-- Lens Card (draggable overlay) -->
    <LensCard
      :position="cardPosition"
      :visible="cardVisible"
      :text="selectedText"
      @close="handleCardClose"
      @update:position="handleCardPositionUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import LensIcon from './components/LensIcon.vue'
import LensCard from './components/LensCard.vue'
import { useTextSelection } from './composables/useTextSelection'
import { useLensState } from './composables/useLensState'

// Setup hooks
const {
  lensPosition,
  lensVisible,
  cardVisible,
  cardPosition,
  setSelectedText,
  showCard,
  showIcon,
  hideCard,
  hideIcon,
  updateCardPosition,
} = useLensState()
const { text: selectedText, rect: selectionRect, isEmpty } = useTextSelection(cardVisible)

// Watch for text selection changes
watch([selectedText, selectionRect, isEmpty], ([text, rect, empty]) => {
  if (empty || !text.trim()) {
    // Hide icon if selection is empty
    hideIcon()
    setSelectedText('')
    return
  }

  // Update selected text
  setSelectedText(text)

  // Show icon at selection position
  if (rect) {
    showIcon(rect)
  }
})

// Handle icon click
const handleIconClick = () => {
  showCard()
}

// Handle card close
const handleCardClose = () => {
  hideCard()
}

// Handle card position update
const handleCardPositionUpdate = (position: { x: number; y: number }) => {
  updateCardPosition(position)
}
</script>

<style scoped>
.fluent-lens-overlay {
  /* Root container styles */
  font-family: 'Inter', sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
</style>
