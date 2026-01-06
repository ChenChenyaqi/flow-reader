<template>
  <div class="fluent-read-container text-base font-sans antialiased text-slate-800">
    <LensIcon
      :show-icon="showIcon"
      :icon-position="iconPosition"
      @click="handleIconClick"
    />

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <LensCard
        v-if="showCard"
        ref="lensCardRef"
        :card-position="cardPosition"
        :selection-text="selectionText"
        :has-config="hasConfig"
        @close="closeCard"
        @config-saved="handleConfigSaved"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import LensIcon from './components/LensIcon.vue'
import LensCard from './components/LensCard.vue'
import { useSelection } from './composables/useSelection'
import useControlConfigCard from './composables/useControlConfigCard'
import { host } from './hostElement'
import useIcon from './composables/useIcon'
import useCard from './composables/useCard'

const { showIcon, iconPosition, updateIconPosition } = useIcon()
const { showCard, cardPosition, updateCardPosition } = useCard()
const { selectionText, clearSelection, handleMouseUp } = useSelection()
const { hasConfig, loadConfig } = useControlConfigCard()

const lensCardRef = ref<any>(null)

// --- Event Handlers ---
const onSelectionMouseUp = (event: MouseEvent) => {
  // Check if mouseup occurred within the extension's host element
  if (event.target instanceof Node && host.contains(event.target)) {
    return
  }

  handleMouseUp(data => {
    updateIconPosition(data.rect)
    showIcon.value = true
  })
}

const hiddenIcon = () => {
  showIcon.value = false
}

const handleIconClick = () => {
  showIcon.value = false
  if (showCard.value) {
    // Card already open: trigger re-analysis with new selection (don't update position)
    lensCardRef.value?.reAnalysis()
  } else {
    // Opening card for the first time: set position and show card
    updateCardPosition(iconPosition.value)
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
  document.addEventListener('mousedown', hiddenIcon)
  loadConfig()
})
onUnmounted(() => {
  document.removeEventListener('mouseup', onSelectionMouseUp)
  document.removeEventListener('mousedown', hiddenIcon)
})
</script>
