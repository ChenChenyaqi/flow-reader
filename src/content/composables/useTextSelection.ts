import { ref, onUnmounted, onMounted, Ref } from 'vue'

export interface TextSelection {
  text: string
  rect: DOMRect | null
  isEmpty: boolean
}

export function useTextSelection(cardVisible: Ref<boolean>) {
  const text = ref<string>('')
  const rect = ref<DOMRect | null>(null)
  const isEmpty = ref<boolean>(true)

  const updateSelection = () => {
    setTimeout(() => {
      if (cardVisible.value) {
        return
      }
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
    }, 500)
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
