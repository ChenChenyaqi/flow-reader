import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLensState } from '../useLensState'

describe('useLensState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should have correct initial state', () => {
    // Act
    const { lensVisible, lensPosition, cardVisible, cardPosition, selectedText } = useLensState()

    // Assert
    expect(lensVisible.value).toBe(false)
    expect(lensPosition.value).toEqual({ x: 0, y: 0 })
    expect(cardVisible.value).toBe(false)
    expect(cardPosition.value).toEqual({ x: 0, y: 0 })
    expect(selectedText.value).toBe('')
  })

  describe('lens visibility methods', () => {
    it('should show lens with correct position', () => {
      // Arrange
      const { lensVisible, lensPosition, showIcon } = useLensState()
      const mockRect = {
        x: 150,
        y: 250,
        width: 100,
        height: 20,
        top: 250,
        right: 250,
        bottom: 270,
        left: 150,
      } as DOMRect

      // Act
      showIcon(mockRect)

      // Assert
      expect(lensVisible.value).toBe(true)
      expect(lensPosition.value).toEqual({
        x: 150 + 100 / 2, // center X
        y: 250 + 20 + 8, // bottom + offset
      })
    })

    it('should hide lens after delay', () => {
      // Arrange
      const { lensVisible, lensPosition, hideIcon } = useLensState()
      lensVisible.value = true
      lensPosition.value = { x: 100, y: 200 }

      // Act
      hideIcon()

      // Assert - Should still be visible immediately
      expect(lensVisible.value).toBe(true)

      // Act - Fast forward 500ms
      vi.advanceTimersByTime(500)

      // Assert - Should be hidden after timeout
      expect(lensVisible.value).toBe(false)
      // Position should remain unchanged
      expect(lensPosition.value).toEqual({ x: 100, y: 200 })
    })

    it('should calculate lens position from rect center', () => {
      // Arrange
      const { lensPosition, showIcon } = useLensState()
      const mockRect = {
        x: 0,
        y: 0,
        width: 200,
        height: 40,
        top: 0,
        right: 200,
        bottom: 40,
        left: 0,
      } as DOMRect

      // Act
      showIcon(mockRect)

      // Assert
      expect(lensPosition.value.x).toBe(100) // 0 + 200/2
      expect(lensPosition.value.y).toBe(48) // 0 + 40 + 8 (bottom + offset)
    })

    it('should handle negative rect coordinates', () => {
      // Arrange
      const { lensPosition, showIcon } = useLensState()
      const mockRect = {
        x: -50,
        y: -30,
        width: 100,
        height: 20,
        top: -30,
        right: 50,
        bottom: -10,
        left: -50,
      } as DOMRect

      // Act
      showIcon(mockRect)

      // Assert
      expect(lensPosition.value.x).toBe(0) // -50 + 100/2
      expect(lensPosition.value.y).toBe(-2) // -30 + 20 + 8
    })
  })

  describe('card visibility methods', () => {
    it('should show card', () => {
      // Arrange
      const { cardVisible, showCard } = useLensState()
      cardVisible.value = false

      // Act
      showCard()

      // Assert
      expect(cardVisible.value).toBe(true)
    })

    it('should hide card', () => {
      // Arrange
      const { cardVisible, hideCard } = useLensState()
      cardVisible.value = true

      // Act
      hideCard()

      // Assert
      expect(cardVisible.value).toBe(false)
    })

    it('should hide lens when showing card', () => {
      // Arrange
      const { lensVisible, cardVisible, showCard } = useLensState()
      lensVisible.value = true

      // Act
      showCard()

      // Assert
      expect(lensVisible.value).toBe(false)
      expect(cardVisible.value).toBe(true)
    })
  })

  describe('position methods', () => {
    it('should update card position', () => {
      // Arrange
      const { cardPosition, updateCardPosition } = useLensState()
      const newPosition = { x: 300, y: 400 }

      // Act
      updateCardPosition(newPosition)

      // Assert
      expect(cardPosition.value).toEqual(newPosition)
    })

    it('should update card position multiple times', () => {
      // Arrange
      const { cardPosition, updateCardPosition } = useLensState()

      // Act
      updateCardPosition({ x: 100, y: 200 })
      updateCardPosition({ x: 150, y: 250 })
      updateCardPosition({ x: 200, y: 300 })

      // Assert
      expect(cardPosition.value).toEqual({ x: 200, y: 300 })
    })
  })

  describe('text methods', () => {
    it('should set selected text', () => {
      // Arrange
      const { selectedText, setSelectedText } = useLensState()
      const text = 'This is a selected text for testing'

      // Act
      setSelectedText(text)

      // Assert
      expect(selectedText.value).toBe(text)
    })

    it('should update selected text', () => {
      // Arrange
      const { selectedText, setSelectedText } = useLensState()
      selectedText.value = 'Initial text'

      // Act
      setSelectedText('Updated text')

      // Assert
      expect(selectedText.value).toBe('Updated text')
    })

    it('should handle empty text', () => {
      // Arrange
      const { selectedText, setSelectedText } = useLensState()
      selectedText.value = 'Previous text'

      // Act
      setSelectedText('')

      // Assert
      expect(selectedText.value).toBe('')
    })

    it('should handle text with special characters', () => {
      // Arrange
      const { selectedText, setSelectedText } = useLensState()
      const text = 'Text with "quotes", \'apostrophes\', and line\nbreaks'

      // Act
      setSelectedText(text)

      // Assert
      expect(selectedText.value).toBe(text)
    })
  })

  describe('integration scenarios', () => {
    it('should handle full workflow: select -> lens -> card', () => {
      // Arrange
      const {
        lensVisible,
        cardVisible,
        cardPosition,
        selectedText,
        showIcon,
        showCard,
        updateCardPosition,
        hideCard,
        setSelectedText,
      } = useLensState()
      const mockRect = {
        x: 100,
        y: 200,
        width: 150,
        height: 20,
        top: 200,
        right: 250,
        bottom: 220,
        left: 100,
      } as DOMRect

      // Act - User selects text
      setSelectedText('Selected text content')
      showIcon(mockRect)

      // Assert - Lens appears
      expect(selectedText.value).toBe('Selected text content')
      expect(lensVisible.value).toBe(true)
      expect(cardVisible.value).toBe(false)

      // Act - User clicks lens
      showCard()

      // Assert - Card appears, lens hides
      expect(lensVisible.value).toBe(false)
      expect(cardVisible.value).toBe(true)

      // Act - User drags card
      updateCardPosition({ x: 300, y: 400 })

      // Assert - Card moves
      expect(cardPosition.value).toEqual({ x: 300, y: 400 })

      // Act - User closes card
      hideCard()

      // Assert - Card hides
      expect(cardVisible.value).toBe(false)
    })

    it('should maintain independent state for multiple instances', () => {
      // Arrange
      const instance1 = useLensState()
      const instance2 = useLensState()

      // Act
      instance1.setSelectedText('First instance text')
      instance1.showIcon({ x: 100, y: 200, width: 50, height: 20 } as DOMRect)

      instance2.setSelectedText('Second instance text')
      instance2.showCard()

      // Assert
      expect(instance1.selectedText.value).toBe('First instance text')
      expect(instance1.lensVisible.value).toBe(true)
      expect(instance1.cardVisible.value).toBe(false)

      expect(instance2.selectedText.value).toBe('Second instance text')
      expect(instance2.lensVisible.value).toBe(false)
      expect(instance2.cardVisible.value).toBe(true)
    })
  })
})
