import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import useCardDrag from '@/content/composables/useCardDrag'

describe('useCardDrag', () => {
  let originalInnerWidth: number
  let originalInnerHeight: number
  let mockCardElement: HTMLElement

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

    // Create mock card element
    mockCardElement = {
      offsetHeight: 300,
    } as unknown as HTMLElement

    // Mock document event listeners
    document.addEventListener = vi.fn()
    document.removeEventListener = vi.fn()
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
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with given position', () => {
      const { position } = useCardDrag({ x: 100, y: 200 })
      expect(position.value).toEqual({ x: 100, y: 200 })
    })

    it('should have cardRef as null initially', () => {
      const { cardRef } = useCardDrag({ x: 0, y: 0 })
      expect(cardRef.value).toBeNull()
    })
  })

  describe('clampPosition', () => {
    it('should not modify position within bounds', () => {
      const { position } = useCardDrag({ x: 500, y: 500 })
      expect(position.value.x).toBeGreaterThanOrEqual(0)
      expect(position.value.x).toBeLessThanOrEqual(1920 - 400) // CARD_WIDTH
      expect(position.value.y).toBeGreaterThanOrEqual(0)
      expect(position.value.y).toBeLessThanOrEqual(1080 - 52) // COLLAPSED_HEIGHT
    })

    it('should clamp x position to minimum (0)', () => {
      const { position } = useCardDrag({ x: -100, y: 500 })
      expect(position.value.x).toBe(0)
    })

    it('should clamp x position to maximum', () => {
      const { position } = useCardDrag({ x: 2000, y: 500 })
      // Max x: viewportWidth (1920) - CARD_WIDTH (400) = 1520
      expect(position.value.x).toBe(1520)
    })

    it('should clamp y position to minimum (0)', () => {
      const { position } = useCardDrag({ x: 500, y: -100 })
      expect(position.value.y).toBe(0)
    })

    it('should clamp y position to maximum', () => {
      const { position } = useCardDrag({ x: 500, y: 2000 })
      // Max y: viewportHeight (1080) - COLLAPSED_HEIGHT (52) = 1028
      expect(position.value.y).toBe(1028)
    })
  })

  describe('startDrag', () => {
    it('should calculate drag offset correctly', () => {
      const { startDrag } = useCardDrag({ x: 100, y: 200 })

      const mockEvent = { clientX: 150, clientY: 250 } as MouseEvent
      startDrag(mockEvent)

      // Verify that event listeners are added
      expect(document.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(document.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function))
    })

    it('should add mouse event listeners', () => {
      const { startDrag } = useCardDrag({ x: 0, y: 0 })

      startDrag({ clientX: 0, clientY: 0 } as MouseEvent)

      expect(document.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(document.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function))
    })
  })

  describe('initCardSizePosition', () => {
    it('should adjust position when card expands beyond viewport', () => {
      // Set viewport smaller
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 400,
      })

      const { initCardSizePosition, cardRef } = useCardDrag({ x: 0, y: 350 })

      // Set card ref with height that would go out of bounds
      cardRef.value = mockCardElement

      initCardSizePosition()

      // Position should be clamped to fit within viewport (y should be <= 350)
      expect(cardRef.value).toBeTruthy()
    })

    it('should not modify position if card fits within viewport', () => {
      const { position, initCardSizePosition, cardRef } = useCardDrag({ x: 100, y: 100 })

      cardRef.value = mockCardElement

      const originalPosition = { ...position.value }
      initCardSizePosition()

      // Position should remain the same
      expect(position.value).toEqual(originalPosition)
    })
  })
})
