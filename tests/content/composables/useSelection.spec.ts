import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSelection } from '@/content/composables/useSelection'

describe('useSelection', () => {
  let mockGetSelection: ReturnType<typeof vi.fn>
  let mockRemoveAllRanges: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()

    // Mock window.getSelection
    mockRemoveAllRanges = vi.fn()
    mockGetSelection = vi.fn(() => ({
      toString: vi.fn(() => ''),
      rangeCount: 0,
      getRangeAt: vi.fn(() => ({
        getBoundingClientRect: vi.fn(() => ({
          left: 0,
          right: 100,
          top: 0,
          bottom: 20,
          width: 100,
          height: 20,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        })),
      })),
      removeAllRanges: mockRemoveAllRanges,
    }))

    // @ts-expect-error - mock window.getSelection
    window.getSelection = mockGetSelection
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('should have empty selectionText', () => {
      const { selectionText } = useSelection()
      expect(selectionText.value).toBe('')
    })
  })

  describe('getSelectionRange', () => {
    it('should return null when no selection exists', () => {
      mockGetSelection.mockReturnValue(null)

      const { handleMouseUp } = useSelection()
      const callback = vi.fn()

      handleMouseUp(callback)
      vi.advanceTimersByTime(10)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should return null when selection has no ranges', () => {
      mockGetSelection.mockReturnValue({
        toString: vi.fn(() => 'test'),
        rangeCount: 0,
      })

      const { handleMouseUp } = useSelection()
      const callback = vi.fn()

      handleMouseUp(callback)
      vi.advanceTimersByTime(10)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should return selection data with text and rect', () => {
      const mockRect = {
        left: 10,
        right: 110,
        top: 5,
        bottom: 25,
        width: 100,
        height: 20,
        x: 10,
        y: 5,
        toJSON: () => ({}),
      }

      mockGetSelection.mockReturnValue({
        toString: vi.fn(() => 'hello world'),
        rangeCount: 1,
        getRangeAt: vi.fn(() => ({
          getBoundingClientRect: vi.fn(() => mockRect),
        })),
      })

      const { handleMouseUp } = useSelection()
      const callback = vi.fn()

      handleMouseUp(callback)
      vi.advanceTimersByTime(10)

      expect(callback).toHaveBeenCalledWith({
        text: 'hello world',
        rect: mockRect,
      })
    })

    it('should trim whitespace from selection text', () => {
      const mockRect = {
        left: 10,
        right: 110,
        top: 5,
        bottom: 25,
        width: 100,
        height: 20,
        x: 10,
        y: 5,
        toJSON: () => ({}),
      }

      mockGetSelection.mockReturnValue({
        toString: vi.fn(() => '  hello world  '),
        rangeCount: 1,
        getRangeAt: vi.fn(() => ({
          getBoundingClientRect: vi.fn(() => mockRect),
        })),
      })

      const { handleMouseUp } = useSelection()
      const callback = vi.fn()

      handleMouseUp(callback)
      vi.advanceTimersByTime(10)

      expect(callback).toHaveBeenCalledWith({
        text: 'hello world',
        rect: mockRect,
      })
    })
  })

  describe('clearSelection', () => {
    it('should clear selection when it exists', () => {
      mockGetSelection.mockReturnValue({
        removeAllRanges: mockRemoveAllRanges,
      })

      const { clearSelection } = useSelection()
      clearSelection()

      expect(mockRemoveAllRanges).toHaveBeenCalled()
    })

    it('should handle when no selection exists', () => {
      mockGetSelection.mockReturnValue(null)

      const { clearSelection } = useSelection()
      expect(() => clearSelection()).not.toThrow()
    })
  })

  describe('handleMouseUp', () => {
    it('should update selectionText for valid selection', () => {
      mockGetSelection.mockReturnValue({
        toString: vi.fn(() => 'this is a valid selection'),
        rangeCount: 1,
        getRangeAt: vi.fn(() => ({
          getBoundingClientRect: vi.fn(() => ({})),
        })),
      })

      const { selectionText, handleMouseUp } = useSelection()

      handleMouseUp()
      vi.advanceTimersByTime(10) // Fast-forward past the setTimeout delay

      expect(selectionText.value).toBe('this is a valid selection')
    })

    it('should not update selectionText for text shorter than MIN_LENGTH', () => {
      mockGetSelection.mockReturnValue({
        toString: vi.fn(() => 'hi'),
        rangeCount: 1,
        getRangeAt: vi.fn(() => ({
          getBoundingClientRect: vi.fn(() => ({})),
        })),
      })

      const { selectionText, handleMouseUp } = useSelection()

      handleMouseUp()
      vi.advanceTimersByTime(10)

      expect(selectionText.value).toBe('')
    })

    it('should clear selectionText when no valid selection', () => {
      mockGetSelection.mockReturnValue({
        toString: vi.fn(() => ''),
        rangeCount: 1,
        getRangeAt: vi.fn(() => ({
          getBoundingClientRect: vi.fn(() => ({})),
        })),
      })

      const { selectionText, handleMouseUp } = useSelection()

      selectionText.value = 'previous text'
      handleMouseUp()
      vi.advanceTimersByTime(10)

      expect(selectionText.value).toBe('')
    })

    it('should call callback with selection data', () => {
      const mockRect = {
        left: 50,
        right: 150,
        top: 10,
        bottom: 30,
        width: 100,
        height: 20,
        x: 50,
        y: 10,
        toJSON: () => ({}),
      }

      mockGetSelection.mockReturnValue({
        toString: vi.fn(() => 'selected text'),
        rangeCount: 1,
        getRangeAt: vi.fn(() => ({
          getBoundingClientRect: vi.fn(() => mockRect),
        })),
      })

      const callback = vi.fn()
      const { handleMouseUp } = useSelection()

      handleMouseUp(callback)
      vi.advanceTimersByTime(10)

      expect(callback).toHaveBeenCalledWith({
        text: 'selected text',
        rect: mockRect,
      })
    })

    it('should not call callback for invalid selection', () => {
      mockGetSelection.mockReturnValue({
        toString: vi.fn(() => 'ab'), // Less than MIN_LENGTH (3)
        rangeCount: 1,
        getRangeAt: vi.fn(() => ({
          getBoundingClientRect: vi.fn(() => ({})),
        })),
      })

      const callback = vi.fn()
      const { handleMouseUp } = useSelection()

      handleMouseUp(callback)
      vi.advanceTimersByTime(10)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should handle callback being optional', () => {
      mockGetSelection.mockReturnValue({
        toString: vi.fn(() => 'test selection'),
        rangeCount: 1,
        getRangeAt: vi.fn(() => ({
          getBoundingClientRect: vi.fn(() => ({})),
        })),
      })

      const { handleMouseUp } = useSelection()

      expect(() => {
        handleMouseUp()
        vi.advanceTimersByTime(10)
      }).not.toThrow()
    })

    it('should trim text before checking length', () => {
      mockGetSelection.mockReturnValue({
        toString: vi.fn(() => '  hi  '), // Trimmed length is 2 (< MIN_LENGTH)
        rangeCount: 1,
        getRangeAt: vi.fn(() => ({
          getBoundingClientRect: vi.fn(() => ({})),
        })),
      })

      const { selectionText, handleMouseUp } = useSelection()

      handleMouseUp()
      vi.advanceTimersByTime(10)

      expect(selectionText.value).toBe('')
    })
  })
})
