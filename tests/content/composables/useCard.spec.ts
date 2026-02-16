import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import useCard from '@/content/composables/useCard'

describe('useCard', () => {
  let originalInnerWidth: number
  let originalInnerHeight: number

  beforeEach(() => {
    // Store original window dimensions
    originalInnerWidth = window.innerWidth
    originalInnerHeight = window.innerHeight

    // Set default viewport size for tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    })
  })

  afterEach(() => {
    // Restore original window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    })
  })

  describe('initial state', () => {
    it('should have showCard as false', () => {
      const { showCard } = useCard()
      expect(showCard.value).toBe(false)
    })

    it('should have cardPosition at origin', () => {
      const { cardPosition } = useCard()
      expect(cardPosition.value).toEqual({ x: 0, y: 0 })
    })
  })

  describe('updateCardPosition', () => {
    it('should update card position', () => {
      const { cardPosition, updateCardPosition } = useCard()

      updateCardPosition({ x: 100, y: 200 })

      expect(cardPosition.value).toEqual({ x: 100, y: 220 }) // y + 20 offset
    })

    it('should add 20px offset to y position', () => {
      const { cardPosition, updateCardPosition } = useCard()

      updateCardPosition({ x: 0, y: 0 })

      expect(cardPosition.value.y).toBe(20)
    })

    it('should clamp x position when card exceeds right viewport edge', () => {
      const { cardPosition, updateCardPosition } = useCard()
      const cardWidth = 400

      // Position that would put card beyond right edge
      updateCardPosition({ x: 1600, y: 100 }, cardWidth)

      // Expected: viewportWidth (1920) - cardWidth (400) - 20 = 1500
      expect(cardPosition.value.x).toBe(1500)
    })

    it('should clamp y position when card exceeds bottom viewport edge', () => {
      const { cardPosition, updateCardPosition } = useCard()
      const cardHeight = 300

      // Position that would put card beyond bottom edge
      updateCardPosition({ x: 100, y: 900 }, 400, cardHeight)

      // Expected: viewportHeight (1080) - cardHeight (300) - 20 = 760
      expect(cardPosition.value.y).toBe(760)
    })

    it('should handle custom card dimensions', () => {
      const { cardPosition, updateCardPosition } = useCard()

      updateCardPosition({ x: 1800, y: 1000 }, 500, 400)

      // Expected x: 1920 - 500 - 20 = 1400
      // Expected y: 1080 - 400 - 20 = 660
      expect(cardPosition.value).toEqual({ x: 1400, y: 660 })
    })

    it('should allow zero position', () => {
      const { cardPosition, updateCardPosition } = useCard()

      updateCardPosition({ x: 0, y: 0 })

      expect(cardPosition.value).toEqual({ x: 0, y: 20 })
    })
  })
})
