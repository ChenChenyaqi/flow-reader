import { ref } from 'vue'

export interface Position {
  x: number
  y: number
}

export function usePosition() {
  const iconPosition = ref<Position>({ x: 0, y: 0 })
  const cardPosition = ref<Position>({ x: 0, y: 0 })

  const calculateIconPosition = (rect: DOMRect): Position => {
    const viewportWidth = window.innerWidth

    let x = rect.right + 10
    const y = rect.bottom + 10

    if (x > viewportWidth - 50) {
      x = rect.left
    }

    return { x, y }
  }

  const calculateCardPosition = (anchor: Position, cardWidth = 400, cardHeight = 300): Position => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x = anchor.x
    let y = anchor.y + 20

    // 边界检查
    if (x + cardWidth > viewportWidth) {
      x = viewportWidth - cardWidth - 20
    }
    if (y + cardHeight > viewportHeight) {
      y = viewportHeight - cardHeight - 20
    }

    return { x, y }
  }

  const setIconPosition = (rect: DOMRect) => {
    iconPosition.value = calculateIconPosition(rect)
  }

  const setCardPosition = (anchor: Position) => {
    cardPosition.value = calculateCardPosition(anchor)
  }

  return {
    iconPosition,
    cardPosition,
    setIconPosition,
    setCardPosition,
  }
}
