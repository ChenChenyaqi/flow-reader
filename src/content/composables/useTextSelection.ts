import { ref, onUnmounted, onMounted } from 'vue'

export interface TextSelection {
  text: string
  rect: DOMRect | null
  isEmpty: boolean
}

export function useTextSelection() {
  const text = ref<string>('')
  const rect = ref<DOMRect | null>(null)
  const isEmpty = ref<boolean>(true)

  const updateSelection = () => {
    const selection = document.getSelection()

    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
      text.value = ''
      rect.value = null
      isEmpty.value = true
      return
    }

    text.value = selection.toString()

    const range = selection.getRangeAt(0)
    rect.value = range.getBoundingClientRect()
    isEmpty.value = false
  }

  onMounted(() => {
    // Initial update
    updateSelection()
    document.addEventListener('selectionchange', updateSelection)
  })

  // Cleanup
  const cleanup = () => {
    document.removeEventListener('selectionchange', updateSelection)
  }

  onUnmounted(cleanup)

  return {
    text,
    rect,
    isEmpty,
    cleanup,
  }
}
