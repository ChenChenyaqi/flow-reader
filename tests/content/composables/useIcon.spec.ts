import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import useIcon from '@/content/composables/useIcon'

describe('useIcon', () => {
  let originalInnerWidth: number

  beforeEach(() => {
    // Store original window width
    originalInnerWidth = window.innerWidth

    // Set default viewport width for tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    })
  })

  afterEach(() => {
    // Restore original window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  describe('initial state', () => {
    it('should have showIcon as false', () => {
      const { showIcon } = useIcon()
      expect(showIcon.value).toBe(false)
    })

    it('should have iconPosition at origin', () => {
      const { iconPosition } = useIcon()
      expect(iconPosition.value).toEqual({ x: 0, y: 0 })
    })
  })

  describe('updateIconPosition', () => {
    it('should position icon to the right of selection', () => {
      const { iconPosition, updateIconPosition } = useIcon()

      const mockRect = {
        left: 100,
        right: 200,
        top: 50,
        bottom: 100,
        width: 100,
        height: 50,
        x: 100,
        y: 50,
        toJSON: () => ({}),
      } as DOMRect

      updateIconPosition(mockRect)

      // Expected x: rect.right + 10 = 200 + 10 = 210
      // Expected y: rect.bottom + 10 = 100 + 10 = 110
      expect(iconPosition.value).toEqual({ x: 210, y: 110 })
    })

    it('should add 10px offset from selection rect', () => {
      const { iconPosition, updateIconPosition } = useIcon()

      const mockRect = {
        left: 0,
        right: 50,
        top: 0,
        bottom: 20,
        width: 50,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect

      updateIconPosition(mockRect)

      expect(iconPosition.value.x).toBe(60) // 50 + 10
      expect(iconPosition.value.y).toBe(30) // 20 + 10
    })

    it('should position icon to the left when exceeding viewport right edge', () => {
      // Set viewport width to 200 for this test
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 200,
      })

      const { iconPosition, updateIconPosition } = useIcon()

      const mockRect = {
        left: 150,
        right: 170,
        top: 50,
        bottom: 70,
        width: 20,
        height: 20,
        x: 150,
        y: 50,
        toJSON: () => ({}),
      } as DOMRect

      updateIconPosition(mockRect)

      // Normal x would be 170 + 10 = 180, but 180 > viewportWidth - 50 = 150
      // So it should use rect.left instead: 150
      expect(iconPosition.value.x).toBe(150)
      expect(iconPosition.value.y).toBe(80) // 70 + 10 (no change for y)
    })

    it('should not move icon left when it fits within viewport', () => {
      const { iconPosition, updateIconPosition } = useIcon()

      const mockRect = {
        left: 1000,
        right: 1200,
        top: 50,
        bottom: 70,
        width: 200,
        height: 20,
        x: 1000,
        y: 50,
        toJSON: () => ({}),
      } as DOMRect

      updateIconPosition(mockRect)

      // 1200 + 10 = 1210, which is less than viewportWidth - 50 = 1870
      // So it should use the normal calculation
      expect(iconPosition.value.x).toBe(1210)
    })

    it('should handle edge case when rect.right is exactly at threshold', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 200,
      })

      const { iconPosition, updateIconPosition } = useIcon()

      const mockRect = {
        left: 130,
        right: 140,
        top: 0,
        bottom: 20,
        width: 10,
        height: 20,
        x: 130,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect

      updateIconPosition(mockRect)

      // 140 + 10 = 150, which equals viewportWidth - 50 = 150
      // The condition is x > viewportWidth - 50, so 150 is NOT > 150
      // Therefore it should use normal calculation
      expect(iconPosition.value.x).toBe(150)
    })
  })
})
