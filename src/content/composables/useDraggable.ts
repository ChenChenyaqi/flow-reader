import { ref, onUnmounted } from 'vue'

export interface DraggableArgs {
  elementRef: { value: HTMLElement | null }
  initialPosition: { x: number; y: number }
}

export interface DraggableReturn {
  position: { value: { x: number; y: number } }
  isDragging: { value: boolean }
  onMousedown: (e: MouseEvent) => void
  cleanup: () => void
}

export function useDraggable({ elementRef, initialPosition }: DraggableArgs): DraggableReturn {
  const position = ref(initialPosition)
  const isDragging = ref(false)

  let startMouseX = 0
  let startMouseY = 0
  let startPosX = 0
  let startPosY = 0

  const onMousedown = (e: MouseEvent) => {
    if (!elementRef.value) return

    e.preventDefault()
    isDragging.value = true

    startMouseX = e.clientX
    startMouseY = e.clientY
    startPosX = position.value.x
    startPosY = position.value.y

    document.addEventListener('mousemove', onMousemove)
    document.addEventListener('mouseup', onMouseup)
  }

  const onMousemove = (e: MouseEvent) => {
    if (!isDragging.value) return

    const deltaX = e.clientX - startMouseX
    const deltaY = e.clientY - startMouseY

    position.value = {
      x: startPosX + deltaX,
      y: startPosY + deltaY,
    }
  }

  const onMouseup = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMousemove)
    document.removeEventListener('mouseup', onMouseup)
  }

  const cleanup = () => {
    document.removeEventListener('mousemove', onMousemove)
    document.removeEventListener('mouseup', onMouseup)
  }

  onUnmounted(cleanup)

  return {
    position,
    isDragging,
    onMousedown,
    cleanup,
  }
}

