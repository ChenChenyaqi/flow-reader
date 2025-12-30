import { ref } from 'vue'

export function useSelection() {
  const selectionText = ref('')

  const getSelectionRange = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null

    const range = selection.getRangeAt(0)
    return {
      text: selection.toString().trim(),
      rect: range.getBoundingClientRect(),
    }
  }

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges()
  }

  const handleMouseUp = (callback?: (data: { text: string; rect: DOMRect }) => void) => {
    setTimeout(() => {
      const data = getSelectionRange()

      if (data?.text) {
        selectionText.value = data.text
        callback?.(data)
      } else {
        selectionText.value = ''
      }
    }, 10)
  }

  return {
    selectionText,
    clearSelection,
    handleMouseUp,
  }
}
