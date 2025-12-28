import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useDraggable } from '../useDraggable'

describe('useDraggable', () => {
  let mockElement: HTMLElement
  let mockAddEventListener: ReturnType<typeof vi.spyOn>
  let mockRemoveEventListener: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Mock HTMLElement
    mockElement = {
      style: {
        transform: '',
        position: '',
      },
      getBoundingClientRect: vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 100,
        height: 50,
      }),
    } as unknown as HTMLElement

    // Mock document event listeners
    mockAddEventListener = vi.spyOn(document, 'addEventListener')
    mockRemoveEventListener = vi.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should set initial position', () => {
    // Arrange
    const initialPosition = { x: 100, y: 200 }
    const elementRef = ref(mockElement)

    // Act
    const { position } = useDraggable({
      elementRef,
      initialPosition,
    })

    // Assert
    expect(position.value).toEqual(initialPosition)
  })

  it('should set isDragging to true on mousedown', () => {
    // Arrange
    const elementRef = ref(mockElement)
    const { isDragging, onMousedown } = useDraggable({
      elementRef,
      initialPosition: { x: 0, y: 0 },
    })

    // Act
    const mousedownEvent = new MouseEvent('mousedown', {
      clientX: 50,
      clientY: 75,
    })
    onMousedown(mousedownEvent)

    // Assert
    expect(isDragging.value).toBe(true)
    expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(mockAddEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function))
  })

  it('should update position during drag', () => {
    // Arrange
    const elementRef = ref(mockElement)
    const { position, onMousedown, isDragging } = useDraggable({
      elementRef,
      initialPosition: { x: 0, y: 0 },
    })

    // Start drag
    const mousedownEvent = new MouseEvent('mousedown', {
      clientX: 50,
      clientY: 75,
    })
    onMousedown(mousedownEvent)

    // Act - Simulate mousemove
    const mousemoveHandler = mockAddEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'mousemove'
    )?.[1] as (e: MouseEvent) => void

    expect(mousemoveHandler).toBeDefined()

    const mousemoveEvent = new MouseEvent('mousemove', {
      clientX: 150,
      clientY: 175,
    })
    mousemoveHandler(mousemoveEvent)

    // Assert
    expect(isDragging.value).toBe(true)
    expect(position.value).toEqual({ x: 100, y: 100 }) // (150-50, 175-75)
  })

  it('should set isDragging to false on mouseup', () => {
    // Arrange
    const elementRef = ref(mockElement)
    const { isDragging, onMousedown } = useDraggable({
      elementRef,
      initialPosition: { x: 0, y: 0 },
    })

    // Start drag
    const mousedownEvent = new MouseEvent('mousedown', {
      clientX: 50,
      clientY: 75,
    })
    onMousedown(mousedownEvent)
    expect(isDragging.value).toBe(true)

    // Act - Simulate mouseup
    const mouseupHandler = mockAddEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'mouseup'
    )?.[1] as (e: MouseEvent) => void

    expect(mouseupHandler).toBeDefined()

    const mouseupEvent = new MouseEvent('mouseup')
    mouseupHandler(mouseupEvent)

    // Assert
    expect(isDragging.value).toBe(false)
    expect(mockRemoveEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(mockRemoveEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function))
  })

  it('should remove event listeners on cleanup', () => {
    // Arrange
    const elementRef = ref(mockElement)
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    // Act
    const { cleanup } = useDraggable({
      elementRef,
      initialPosition: { x: 0, y: 0 },
    })

    // Trigger cleanup
    cleanup?.()

    // Assert
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
  })

  it('should handle drag with element reference changes', () => {
    // Arrange
    const elementRef = ref<HTMLElement | null>(null)
    const { onMousedown } = useDraggable({
      elementRef,
      initialPosition: { x: 0, y: 0 },
    })

    // Act - Try to start drag without element
    const mousedownEvent = new MouseEvent('mousedown')
    onMousedown(mousedownEvent)

    // Assert - Should not crash
    expect(onMousedown).not.toThrow()
  })

  it('should calculate position offset correctly', () => {
    // Arrange
    const elementRef = ref(mockElement)

    // Mock element position
    vi.mocked(mockElement.getBoundingClientRect).mockReturnValue({
      left: 100,
      top: 100,
      width: 200,
      height: 100,
      right: 300,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    })

    const { position, onMousedown } = useDraggable({
      elementRef,
      initialPosition: { x: 0, y: 0 },
    })

    // Start drag from element center
    const mousedownEvent = new MouseEvent('mousedown', {
      clientX: 200, // element center X (100 + 200/2)
      clientY: 150, // element center Y (100 + 100/2)
    })
    onMousedown(mousedownEvent)

    // Move mouse
    const mousemoveHandler = mockAddEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'mousemove'
    )?.[1] as (e: MouseEvent) => void

    const mousemoveEvent = new MouseEvent('mousemove', {
      clientX: 300,
      clientY: 250,
    })
    mousemoveHandler(mousemoveEvent)

    // Assert - position should be offset by mouse movement
    expect(position.value).toEqual({ x: 100, y: 100 }) // (300-200, 250-150)
  })
})

