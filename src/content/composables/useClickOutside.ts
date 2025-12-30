import { onMounted, onUnmounted } from 'vue'

export function useClickOutside(
  targetId: string,
  callback: () => void,
  options: { ignoreOutsideClick?: boolean } = {}
) {
  const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const shadowHost = document.getElementById(targetId)

    if (options.ignoreOutsideClick) {
      return
    }

    if (target === shadowHost || shadowHost?.contains(target)) {
      return
    }

    // click outside
    callback()
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleMouseDown)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', handleMouseDown)
  })
}
