import { ref } from 'vue'

export default function useIcon() {
  const showIcon = ref(false)
  const iconPosition = ref({ x: 0, y: 0 })

  const updateIconPosition = (rect: DOMRect) => {
    const viewportWidth = window.innerWidth

    let x = rect.right + 10
    const y = rect.bottom + 10

    if (x > viewportWidth - 50) {
      x = rect.left
    }
    iconPosition.value = { x, y }
  }

  return {
    showIcon,
    iconPosition,
    updateIconPosition,
  }
}
