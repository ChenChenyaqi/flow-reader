import { ref } from 'vue'

// Card dimensions
const CARD_WIDTH = 400
const COLLAPSED_HEIGHT = 52 // Header height
export default function useCardDrag(cardPosition: { x: number; y: number }) {
  // Card ref for getting actual dimensions
  const cardRef = ref<HTMLElement | null>(null)
  // Draggable state
  const position = ref(clampPosition(cardPosition.x, cardPosition.y))
  const isDragging = ref(false)
  const dragOffset = ref({ x: 0, y: 0 })

  /**
   * Clamp position to keep card within viewport
   */
  function clampPosition(x: number, y: number): { x: number; y: number } {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const cardHeight = getCardHeight()

    return {
      x: Math.max(0, Math.min(x, viewportWidth - CARD_WIDTH)),
      y: Math.max(0, Math.min(y, viewportHeight - cardHeight)),
    }
  }

  /**
   * Get actual card height from DOM
   */
  function getCardHeight(): number {
    return cardRef.value?.offsetHeight || COLLAPSED_HEIGHT
  }

  /**
   * Start dragging
   */
  function startDrag(event: MouseEvent) {
    isDragging.value = true
    dragOffset.value = {
      x: event.clientX - position.value.x,
      y: event.clientY - position.value.y,
    }
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
  }

  /**
   * Handle dragging with boundary checking
   */
  function onDrag(event: MouseEvent) {
    if (!isDragging.value) return

    const newX = event.clientX - dragOffset.value.x
    const newY = event.clientY - dragOffset.value.y

    position.value = clampPosition(newX, newY)
  }

  /**
   * Stop dragging
   */
  function stopDrag() {
    isDragging.value = false
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
  }

  function initCardSizePosition() {
    // Check if expanding would go out of bounds
    const viewportHeight = window.innerHeight
    const cardHeight = getCardHeight()
    const bottomEdge = position.value.y + cardHeight

    if (bottomEdge > viewportHeight) {
      // Move card up to fit
      position.value = clampPosition(position.value.x, position.value.y)
    }
  }

  return {
    cardRef,
    position,
    startDrag,
    initCardSizePosition,
  }
}
