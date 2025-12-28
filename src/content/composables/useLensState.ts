import { ref } from 'vue'

export function useLensState() {
  const lensVisible = ref(false)
  const lensPosition = ref({ x: 0, y: 0 })
  const cardVisible = ref(false)
  const cardPosition = ref({ x: 0, y: 0 })
  const selectedText = ref('')

  const showIcon = (rect: DOMRect) => {
    // Calculate icon position at the center bottom of selection
    const iconX = rect.x + rect.width / 2
    const iconY = rect.y + rect.height + 8 // 8px offset below selection

    lensVisible.value = true
    lensPosition.value = { x: iconX, y: iconY }
  }

  const hideIcon = () => {
    // 如果图标刚被点击，延迟隐藏，确保点击事件能完成
    setTimeout(() => {
      lensVisible.value = false
    }, 500)
  }

  const showCard = () => {
    // Hide icon when showing card
    lensVisible.value = false
    cardVisible.value = true
  }

  const hideCard = () => {
    cardVisible.value = false
  }

  const updateCardPosition = (position: { x: number; y: number }) => {
    cardPosition.value = position
  }

  const setSelectedText = (text: string) => {
    selectedText.value = text
  }

  return {
    lensVisible,
    lensPosition,
    cardVisible,
    cardPosition,
    selectedText,
    showIcon,
    hideIcon,
    showCard,
    hideCard,
    updateCardPosition,
    setSelectedText,
  }
}
