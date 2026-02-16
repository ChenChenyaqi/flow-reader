import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  sendMessage,
  sendMessageNoResponse,
  MessageListenerManager,
  createMessageListenerManager,
} from '@/content/utils/chromeApi'

// Mock chrome runtime
// Create a mutable lastError object that can be modified in tests
const mockLastError = { value: undefined as { message?: string } | undefined }

const sendMessageMock = vi.fn((_message: unknown, callback?: (response: unknown) => void) => {
  if (callback) {
    callback({ success: true })
  }
})
const addListenerMock = vi.fn()
const removeListenerMock = vi.fn()

vi.stubGlobal('chrome', {
  runtime: {
    sendMessage: sendMessageMock,
    onMessage: {
      addListener: addListenerMock,
      removeListener: removeListenerMock,
    },
    get lastError() {
      return mockLastError.value
    },
  },
})

describe('chromeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLastError.value = undefined
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    // Reset to default implementation
    sendMessageMock.mockImplementation(
      (_message: unknown, callback?: (response: unknown) => void) => {
        if (callback) {
          callback({ success: true })
        }
      }
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sendMessage', () => {
    it('should send message and resolve with response', async () => {
      const mockResponse = { data: 'test response' }
      sendMessageMock.mockImplementation((_, callback) => {
        callback!(mockResponse)
      })

      const result = await sendMessage({ type: 'TEST_MESSAGE' })

      expect(result).toBe(mockResponse)
      expect(sendMessageMock).toHaveBeenCalledWith({ type: 'TEST_MESSAGE' }, expect.any(Function))
    })

    it('should reject when chrome.runtime.lastError is set', async () => {
      const mockError = { message: 'API error occurred' }
      sendMessageMock.mockImplementation((_, callback) => {
        mockLastError.value = mockError
        callback!(undefined)
      })

      await expect(sendMessage({ type: 'TEST' })).rejects.toThrow('API error occurred')
    })

    it('should reject with "Unknown Chrome error" when lastError.message is missing', async () => {
      sendMessageMock.mockImplementation((_, callback) => {
        mockLastError.value = {}
        callback!(undefined)
      })

      await expect(sendMessage({ type: 'TEST' })).rejects.toThrow('Unknown Chrome error')
    })

    it('should handle null response correctly', async () => {
      sendMessageMock.mockImplementation((_, callback) => {
        callback!(null)
      })

      const result = await sendMessage({ type: 'TEST' })
      expect(result).toBeNull()
    })

    it('should handle undefined response correctly', async () => {
      sendMessageMock.mockImplementation((_, callback) => {
        callback!(undefined)
      })

      const result = await sendMessage({ type: 'TEST' })
      expect(result).toBeUndefined()
    })
  })

  describe('sendMessageNoResponse', () => {
    it('should send message without callback', () => {
      sendMessageNoResponse({ type: 'FIRE_AND_FORGET' })

      expect(sendMessageMock).toHaveBeenCalledTimes(1)
      expect(sendMessageMock).toHaveBeenCalledWith({ type: 'FIRE_AND_FORGET' })
      // Verify no second argument (callback) was passed
      const call = sendMessageMock.mock.calls[0]
      expect(call.length).toBe(1)
    })

    it('should not throw any errors', () => {
      expect(() => {
        sendMessageNoResponse({ type: 'TEST' })
      }).not.toThrow()
    })

    it('should return undefined', () => {
      const result = sendMessageNoResponse({ type: 'TEST' })
      expect(result).toBeUndefined()
    })
  })

  describe('MessageListenerManager', () => {
    let manager: MessageListenerManager

    beforeEach(() => {
      manager = new MessageListenerManager()
      addListenerMock.mockClear()
      removeListenerMock.mockClear()
    })

    describe('initial state', () => {
      it('should start with no active listener', () => {
        expect(manager.active).toBe(false)
      })

      it('should not have listener initially', () => {
        expect(addListenerMock).not.toHaveBeenCalled()
      })
    })

    describe('addListener', () => {
      it('should add a listener to chrome.runtime.onMessage', () => {
        const mockListener = vi.fn()

        manager.addListener(mockListener)

        expect(addListenerMock).toHaveBeenCalledWith(mockListener)
        expect(manager.active).toBe(true)
      })

      it('should replace existing listener when adding new one', () => {
        const listener1 = vi.fn()
        const listener2 = vi.fn()

        manager.addListener(listener1)
        manager.addListener(listener2)

        expect(removeListenerMock).toHaveBeenCalledWith(listener1)
        expect(addListenerMock).toHaveBeenCalledTimes(2)
        expect(console.warn).toHaveBeenCalledWith(
          '[MessageListenerManager] Listener already active, replacing it'
        )
      })

      it('should update active status to true', () => {
        const mockListener = vi.fn()

        expect(manager.active).toBe(false)
        manager.addListener(mockListener)
        expect(manager.active).toBe(true)
      })
    })

    describe('remove', () => {
      it('should remove the listener from chrome.runtime.onMessage', () => {
        const mockListener = vi.fn()

        manager.addListener(mockListener)
        removeListenerMock.mockClear()

        manager.remove()

        expect(removeListenerMock).toHaveBeenCalledWith(mockListener)
        expect(manager.active).toBe(false)
      })

      it('should handle remove when no listener is active', () => {
        expect(() => manager.remove()).not.toThrow()
        expect(removeListenerMock).not.toHaveBeenCalled()
      })

      it('should set active status to false after removal', () => {
        const mockListener = vi.fn()

        manager.addListener(mockListener)
        expect(manager.active).toBe(true)

        manager.remove()
        expect(manager.active).toBe(false)
      })

      it('should clear the listener reference', () => {
        const mockListener = vi.fn()

        manager.addListener(mockListener)
        manager.remove()
        manager.remove() // Second remove should not call chrome.runtime.onMessage.removeListener

        expect(removeListenerMock).toHaveBeenCalledTimes(1)
      })
    })

    describe('active getter', () => {
      it('should return false initially', () => {
        expect(manager.active).toBe(false)
      })

      it('should return true after adding listener', () => {
        const mockListener = vi.fn()
        manager.addListener(mockListener)

        expect(manager.active).toBe(true)
      })

      it('should return false after removing listener', () => {
        const mockListener = vi.fn()
        manager.addListener(mockListener)
        manager.remove()

        expect(manager.active).toBe(false)
      })
    })

    describe('dispose', () => {
      it('should remove the active listener', () => {
        const mockListener = vi.fn()

        manager.addListener(mockListener)
        manager.dispose()

        expect(manager.active).toBe(false)
        expect(removeListenerMock).toHaveBeenCalledWith(mockListener)
      })

      it('should handle dispose when no listener is active', () => {
        expect(() => manager.dispose()).not.toThrow()
        expect(removeListenerMock).not.toHaveBeenCalled()
      })

      it('should be safe to call dispose multiple times', () => {
        const mockListener = vi.fn()

        manager.addListener(mockListener)
        manager.dispose()
        manager.dispose() // Second dispose
        manager.dispose() // Third dispose

        expect(removeListenerMock).toHaveBeenCalledTimes(1)
      })

      it('should reset active status', () => {
        const mockListener = vi.fn()

        manager.addListener(mockListener)
        expect(manager.active).toBe(true)

        manager.dispose()
        expect(manager.active).toBe(false)
      })
    })

    describe('lifecycle scenarios', () => {
      it('should handle full lifecycle: add -> remove -> add -> dispose', () => {
        const listener1 = vi.fn()
        const listener2 = vi.fn()

        // First lifecycle
        manager.addListener(listener1)
        expect(manager.active).toBe(true)

        manager.remove()
        expect(manager.active).toBe(false)

        // Second lifecycle
        manager.addListener(listener2)
        expect(manager.active).toBe(true)

        manager.dispose()
        expect(manager.active).toBe(false)

        expect(addListenerMock).toHaveBeenCalledTimes(2)
        expect(removeListenerMock).toHaveBeenCalledTimes(2)
      })

      it('should handle adding listener after dispose', () => {
        const listener1 = vi.fn()
        const listener2 = vi.fn()

        manager.addListener(listener1)
        manager.dispose()

        addListenerMock.mockClear()
        removeListenerMock.mockClear()

        manager.addListener(listener2)

        expect(addListenerMock).toHaveBeenCalledWith(listener2)
        expect(manager.active).toBe(true)
      })
    })
  })

  describe('createMessageListenerManager', () => {
    it('should create a new MessageListenerManager instance', () => {
      const manager1 = createMessageListenerManager()
      const manager2 = createMessageListenerManager()

      expect(manager1).not.toBe(manager2)
      expect(manager1).toBeInstanceOf(MessageListenerManager)
      expect(manager2).toBeInstanceOf(MessageListenerManager)
    })

    it('should create independent managers', () => {
      const manager1 = createMessageListenerManager()
      const manager2 = createMessageListenerManager()

      const listener1 = vi.fn()
      const listener2 = vi.fn()

      manager1.addListener(listener1)
      manager2.addListener(listener2)

      expect(manager1.active).toBe(true)
      expect(manager2.active).toBe(true)

      manager1.remove()

      expect(manager1.active).toBe(false)
      expect(manager2.active).toBe(true)
    })

    it('should create manager with initial inactive state', () => {
      const manager = createMessageListenerManager()

      expect(manager.active).toBe(false)
    })
  })

  describe('integration with sendMessage', () => {
    it('should work correctly with listener manager for streaming', async () => {
      const manager = createMessageListenerManager()
      const mockListener = vi.fn()

      // Set up listener for streaming
      manager.addListener(mockListener)

      expect(manager.active).toBe(true)

      // Clean up
      manager.dispose()
      expect(manager.active).toBe(false)
    })

    it('should handle multiple sequential requests', async () => {
      const responses = [
        { id: 1, data: 'first' },
        { id: 2, data: 'second' },
        { id: 3, data: 'third' },
      ]

      for (const response of responses) {
        mockLastError.value = undefined
        sendMessageMock.mockImplementationOnce((_, callback) => {
          callback!(response)
        })

        const result = await sendMessage({ type: 'TEST' })
        expect(result).toEqual(response)
      }

      expect(sendMessageMock).toHaveBeenCalledTimes(3)
    })
  })
})
