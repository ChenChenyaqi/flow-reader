import { ref } from 'vue'

export default function useCard() {
  const showCard = ref(false)
  const cardPosition = ref({ x: 0, y: 0 })

  const updateCardPosition = (
    position: { x: number; y: number },
    cardWidth = 400,
    cardHeight = 300
  ) => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x = position.x
    let y = position.y + 20

    // 边界检查
    if (x + cardWidth > viewportWidth) {
      x = viewportWidth - cardWidth - 20
    }
    if (y + cardHeight > viewportHeight) {
      y = viewportHeight - cardHeight - 20
    }

    cardPosition.value = { x, y }
  }

  return {
    showCard,
    cardPosition,
    updateCardPosition,
  }
}
