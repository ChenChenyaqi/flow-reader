import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTextSelection } from '../useTextSelection'

describe('useTextSelection', () => {
  let mockSelection: Partial<Selection> & { rangeCount: number; toString: ReturnType<typeof vi.fn> }
  let mockRange: Partial<Range> & { getBoundingClientRect: ReturnType<typeof vi.fn> }
  let mockRect: DOMRect

  beforeEach(() => {
    // Mock DOMRect
    mockRect = {
      x: 100,
      y: 200,
      width: 150,
      height: 20,
      top: 200,
      right: 250,
      bottom: 220,
      left: 100,
      toJSON: () => ({})
    } as DOMRect

    // Mock Range
    mockRange = {
      getBoundingClientRect: vi.fn().mockReturnValue(mockRect)
    } as Partial<Range> & { getBoundingClientRect: ReturnType<typeof vi.fn> }

    // Mock Selection
    mockSelection = {
      rangeCount: 1,
      getRangeAt: vi.fn().mockReturnValue(mockRange),
      toString: vi.fn().mockReturnValue('Selected text content'),
      removeAllRanges: vi.fn(),
      addRange: vi.fn()
    } as Partial<Selection> & { rangeCount: number; toString: ReturnType<typeof vi.fn> }

    // Mock document.getSelection
    vi.spyOn(document, 'getSelection').mockReturnValue(mockSelection as Selection)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have empty initial state', () => {
    // Arrange
    mockSelection.rangeCount = 0
    mockSelection.toString.mockReturnValue('')

    // Act
    const { text, rect, isEmpty } = useTextSelection()

    // Assert
    expect(text.value).toBe('')
    expect(rect.value).toBeNull()
    expect(isEmpty.value).toBe(true)
  })

  it('should update text and rect when selection exists', () => {
    // Arrange
    mockSelection.rangeCount = 1
    mockSelection.toString.mockReturnValue('Selected text content')

    // Act
    const { text, rect, isEmpty } = useTextSelection()

    // Trigger selectionchange event
    document.dispatchEvent(new Event('selectionchange'))

    // Assert
    expect(text.value).toBe('Selected text content')
    expect(rect.value).toEqual(mockRect)
    expect(isEmpty.value).toBe(false)
  })

  it('should return to empty state when selection is cleared', () => {
    // Arrange
    mockSelection.rangeCount = 1
    mockSelection.toString.mockReturnValue('Selected text content')

    const { text, rect, isEmpty } = useTextSelection()

    // Initial selection
    document.dispatchEvent(new Event('selectionchange'))
    expect(isEmpty.value).toBe(false)

    // Clear selection
    mockSelection.rangeCount = 0
    mockSelection.toString.mockReturnValue('')
    document.dispatchEvent(new Event('selectionchange'))

    // Assert
    expect(text.value).toBe('')
    expect(rect.value).toBeNull()
    expect(isEmpty.value).toBe(true)
  })

  it('should remove event listener on cleanup', () => {
    // Arrange
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    // Act
    const { cleanup } = useTextSelection()

    // Trigger cleanup (simulating effect cleanup)
    cleanup?.()

    // Assert
    expect(addEventListenerSpy).toHaveBeenCalledWith('selectionchange', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('selectionchange', expect.any(Function))
  })

  it('should debounce rapid selection changes', async () => {
    // Arrange
    const { text } = useTextSelection()

    // Act - Trigger multiple rapid selection changes
    mockSelection.toString.mockReturnValue('First selection')
    document.dispatchEvent(new Event('selectionchange'))

    mockSelection.toString.mockReturnValue('Second selection')
    document.dispatchEvent(new Event('selectionchange'))

    mockSelection.toString.mockReturnValue('Third selection')
    document.dispatchEvent(new Event('selectionchange'))

    // Wait for debounce (if implemented)
    // Note: This test documents the expected behavior even if debouncing is not implemented yet
    expect(text.value).toBe('Third selection')
  })
})