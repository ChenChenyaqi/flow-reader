<template>
  <div class="fluent-read-container text-base font-sans antialiased text-slate-800">
    <LensIcon
      :show-icon="showIcon"
      :icon-position="iconPosition"
      @click="handleIconClick"
    />
    <LensCard
      :show-card="showCard"
      :card-position="cardPosition"
      :selection-text="selectionText"
      :has-config="hasConfig"
      :trigger-simplify="triggerSimplify"
      @close="closeCard"
      @config-saved="handleConfigSaved"
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
import useControlConfigCard from './composables/useControlConfigCard'
import { shouldShowIcon } from './utils/textUtils'

// --- Composables ---
const { selectionText, clearSelection, handleMouseUp } = useSelection()
const { iconPosition, cardPosition, setIconPosition, setCardPosition } = usePosition()
const { hasConfig, loadConfig } = useControlConfigCard()

// --- UI State ---
const showIcon = ref(false)
const showCard = ref(false)
const triggerSimplify = ref(0)

// --- Event Handlers ---
const onSelectionMouseUp = () => {
  handleMouseUp(data => {
    // check selected text
    if (!shouldShowIcon(data.text)) {
      showIcon.value = false
      return
    }

    setIconPosition(data.rect)
    showIcon.value = true
  })
}

useClickOutside('fluent-read-host', () => {
  showIcon.value = false
})

const handleIconClick = () => {
  showIcon.value = false

  if (showCard.value) {
    // Card already open: trigger re-analysis with new selection (don't update position)
    triggerSimplify.value++
  } else {
    // Opening card for the first time: set position and show card
    setCardPosition(iconPosition.value)
    showCard.value = true
    loadConfig()
  }
}

const closeCard = () => {
  showCard.value = false
  clearSelection()
}

const handleConfigSaved = () => {
  // Reload config after saving
  loadConfig()
}

// --- Lifecycle ---
onMounted(() => {
  document.addEventListener('mouseup', onSelectionMouseUp)
  loadConfig()
})
onUnmounted(() => {
  document.removeEventListener('mouseup', onSelectionMouseUp)
})
</script>
