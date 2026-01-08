<template>
  <div
    ref="_cardRef"
    class="fixed z-[999999] w-[400px] bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
    }"
  >
    <!-- Card Header -->
    <LensHeader
      :show-config="showConfig"
      :is-collapsed="isCollapsed"
      @start-drag="startDrag"
      @toggle-collapse="toggleCollapse"
      @open-config="showConfig = true"
      @close="handleClose"
      @back="handleBack"
    />

    <!-- No Config Warning -->
    <NoConfigTip v-if="!hasConfig && !isCollapsed && !showConfig" />

    <!-- Config Form -->
    <ConfigTab
      v-if="showConfig && !isCollapsed"
      @close="showConfig = false"
      @saved="handleConfigSaved"
    />

    <!-- Card Body (Analysis Content) -->
    <AnalysisTab
      v-show="!isCollapsed && !showConfig && hasConfig"
      ref="analysisTabRef"
      v-model="analysising"
      :analyzing-text="selectionText"
    />

    <!-- Card Footer (only when not in config mode) -->
    <LensFooter
      v-if="!isCollapsed && !showConfig"
      :analyzing-text="selectionText"
      :analysising="analysising"
      :has-config="hasConfig"
      @analysis="handleAnalysis"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onUnmounted, onMounted } from 'vue'
import LensHeader from './LensHeader.vue'
import NoConfigTip from './NoConfigTip.vue'
import LensFooter from './LensFooter.vue'
import useCardDrag from '../composables/useCardDrag'
import ConfigTab from './config-tab/ConfigTab.vue'
import AnalysisTab from './analysis-tab/AnalysisTab.vue'

const props = defineProps<{
  cardPosition: {
    x: number
    y: number
  }
  selectionText: string
  hasConfig: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'configSaved'): void
}>()

const showConfig = ref(false)
const isCollapsed = ref(false)

const analysisTabRef = ref<any>(null)
const analysising = ref(false)

const {
  cardRef: _cardRef,
  position,
  startDrag,
  initCardSizePosition,
} = useCardDrag(props.cardPosition)

/**
 * Toggle collapse state with boundary check
 */
async function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value

  // Wait for DOM to update after expand
  await nextTick()
  initCardSizePosition()
}

const handleAnalysis = () => {
  analysisTabRef.value?.startAnalysis()
}

/**
 * Handle close - reset state before closing
 */
function handleClose() {
  isCollapsed.value = false
  emit('close')
}

const handleBack = () => {
  showConfig.value = false
}

const handleConfigSaved = () => {
  emit('configSaved')
  showConfig.value = false
}

onMounted(() => {
  nextTick(() => {
    handleAnalysis()
  })
})

onUnmounted(() => {
  analysisTabRef.value?.cancelAnalysis()
})

defineExpose({
  reAnalysis: () => {
    if (props.selectionText && props.hasConfig) {
      // Save the new text being analyzed
      handleAnalysis()
    }
  },
})
</script>

<style scoped></style>
