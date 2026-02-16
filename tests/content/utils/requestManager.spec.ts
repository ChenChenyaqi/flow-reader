import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRequestManager } from '@/content/utils/requestManager'
import type { CancelLLMRequestMessage } from '@/shared/types/llm'

// Mock chrome.runtime.sendMessage
const sendMessageMock = vi.fn()

// Set up chrome mock before importing the module
vi.stubGlobal('chrome', {
  runtime: {
    sendMessage: sendMessageMock,
  },
})

describe('requestManager', () => {
  let manager: ReturnType<typeof createRequestManager>

  beforeEach(() => {
    manager = createRequestManager()
    sendMessageMock.mockClear()
  })

  afterEach(() => {
    manager.dispose()
  })

  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = manager.generateRequestId()
      const id2 = manager.generateRequestId()
      const id3 = manager.generateRequestId()

      expect(id1).not.toBe(id2)
      expect(id2).not.toBe(id3)
      expect(id1).not.toBe(id3)
    })

    it('should generate IDs with expected format', () => {
      const id = manager.generateRequestId()

      expect(id).toMatch(/^req_\d+_\d+_[a-z0-9]+$/)
    })

    it('should include timestamp in request ID', () => {
      const beforeTime = Date.now()
      const id = manager.generateRequestId()
      const afterTime = Date.now()

      const timestamp = parseInt(id.split('_')[1])
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('should increment counter for each ID', () => {
      const id1 = manager.generateRequestId()
      const id2 = manager.generateRequestId()
      const id3 = manager.generateRequestId()

      const counter1 = parseInt(id1.split('_')[2])
      const counter2 = parseInt(id2.split('_')[2])
      const counter3 = parseInt(id3.split('_')[2])

      expect(counter2).toBe(counter1 + 1)
      expect(counter3).toBe(counter2 + 1)
    })
  })

  describe('trackRequest', () => {
    it('should track a request by ID', () => {
      const requestId = 'req_test_123'

      manager.trackRequest(requestId)

      expect(manager.isRequestActive(requestId)).toBe(true)
      expect(manager.getActiveCount()).toBe(1)
    })

    it('should track multiple requests', () => {
      const id1 = 'req_test_1'
      const id2 = 'req_test_2'
      const id3 = 'req_test_3'

      manager.trackRequest(id1)
      manager.trackRequest(id2)
      manager.trackRequest(id3)

      expect(manager.getActiveCount()).toBe(3)
    })

    it('should not duplicate tracking of same request ID', () => {
      const requestId = 'req_test_123'

      manager.trackRequest(requestId)
      manager.trackRequest(requestId)

      expect(manager.getActiveCount()).toBe(1)
    })

    it('should return all tracked request IDs', () => {
      const id1 = 'req_test_1'
      const id2 = 'req_test_2'

      manager.trackRequest(id1)
      manager.trackRequest(id2)

      const activeRequests = manager.getActiveRequests()

      expect(activeRequests).toContain(id1)
      expect(activeRequests).toContain(id2)
      expect(activeRequests).toHaveLength(2)
    })
  })

  describe('removeRequest', () => {
    it('should remove a tracked request', () => {
      const requestId = 'req_test_123'

      manager.trackRequest(requestId)
      expect(manager.isRequestActive(requestId)).toBe(true)

      manager.removeRequest(requestId)
      expect(manager.isRequestActive(requestId)).toBe(false)
    })

    it('should decrease active count when removing request', () => {
      const id1 = 'req_test_1'
      const id2 = 'req_test_2'

      manager.trackRequest(id1)
      manager.trackRequest(id2)
      expect(manager.getActiveCount()).toBe(2)

      manager.removeRequest(id1)
      expect(manager.getActiveCount()).toBe(1)
    })

    it('should handle removing non-existent request gracefully', () => {
      expect(() => manager.removeRequest('non_existent')).not.toThrow()
      expect(manager.getActiveCount()).toBe(0)
    })

    it('should handle removing already removed request', () => {
      const requestId = 'req_test_123'

      manager.trackRequest(requestId)
      manager.removeRequest(requestId)
      manager.removeRequest(requestId) // Second removal

      expect(manager.getActiveCount()).toBe(0)
    })
  })

  describe('isRequestActive', () => {
    it('should return true for active request', () => {
      const requestId = 'req_test_123'

      manager.trackRequest(requestId)

      expect(manager.isRequestActive(requestId)).toBe(true)
    })

    it('should return false for non-tracked request', () => {
      expect(manager.isRequestActive('non_existent')).toBe(false)
    })

    it('should return false after removing request', () => {
      const requestId = 'req_test_123'

      manager.trackRequest(requestId)
      manager.removeRequest(requestId)

      expect(manager.isRequestActive(requestId)).toBe(false)
    })
  })

  describe('getActiveRequests', () => {
    it('should return empty array when no requests', () => {
      const requests = manager.getActiveRequests()

      expect(requests).toEqual([])
      expect(Array.isArray(requests)).toBe(true)
    })

    it('should return all active request IDs', () => {
      const id1 = 'req_a'
      const id2 = 'req_b'
      const id3 = 'req_c'

      manager.trackRequest(id1)
      manager.trackRequest(id2)
      manager.trackRequest(id3)

      const requests = manager.getActiveRequests()

      expect(requests).toHaveLength(3)
      expect(requests).toContain(id1)
      expect(requests).toContain(id2)
      expect(requests).toContain(id3)
    })

    it('should return a copy of the requests (not direct reference)', () => {
      const requestId = 'req_test_123'

      manager.trackRequest(requestId)
      const requests1 = manager.getActiveRequests()
      const requests2 = manager.getActiveRequests()

      expect(requests1).not.toBe(requests2)
      expect(requests1).toEqual(requests2)
    })
  })

  describe('getActiveCount', () => {
    it('should return 0 when no requests', () => {
      expect(manager.getActiveCount()).toBe(0)
    })

    it('should return correct count for multiple requests', () => {
      manager.trackRequest('req_1')
      expect(manager.getActiveCount()).toBe(1)

      manager.trackRequest('req_2')
      expect(manager.getActiveCount()).toBe(2)

      manager.trackRequest('req_3')
      expect(manager.getActiveCount()).toBe(3)
    })

    it('should update count after tracking and removing', () => {
      const id1 = 'req_1'
      const id2 = 'req_2'

      manager.trackRequest(id1)
      manager.trackRequest(id2)
      expect(manager.getActiveCount()).toBe(2)

      manager.removeRequest(id1)
      expect(manager.getActiveCount()).toBe(1)

      manager.removeRequest(id2)
      expect(manager.getActiveCount()).toBe(0)
    })
  })

  describe('cancelRequest', () => {
    it('should send cancel message to chrome runtime', () => {
      const requestId = 'req_test_123'

      manager.cancelRequest(requestId)

      const expectedMessage: CancelLLMRequestMessage = {
        type: 'CANCEL_LLM_REQUEST',
        requestId,
      }

      expect(sendMessageMock).toHaveBeenCalledWith(expectedMessage)
    })

    it('should remove request from tracking after cancellation', () => {
      const requestId = 'req_test_123'

      manager.trackRequest(requestId)
      expect(manager.isRequestActive(requestId)).toBe(true)

      manager.cancelRequest(requestId)
      expect(manager.isRequestActive(requestId)).toBe(false)
    })

    it('should handle cancelling non-existent request', () => {
      expect(() => manager.cancelRequest('non_existent')).not.toThrow()
      expect(sendMessageMock).toHaveBeenCalledOnce()
    })
  })

  describe('cancelAll', () => {
    it('should cancel all active requests', () => {
      const id1 = 'req_1'
      const id2 = 'req_2'
      const id3 = 'req_3'

      manager.trackRequest(id1)
      manager.trackRequest(id2)
      manager.trackRequest(id3)

      manager.cancelAll()

      expect(manager.getActiveCount()).toBe(0)
      expect(sendMessageMock).toHaveBeenCalledTimes(3)
    })

    it('should send cancel message for each active request', () => {
      const id1 = 'req_test_1'
      const id2 = 'req_test_2'

      manager.trackRequest(id1)
      manager.trackRequest(id2)

      manager.cancelAll()

      expect(sendMessageMock).toHaveBeenCalledWith({
        type: 'CANCEL_LLM_REQUEST',
        requestId: id1,
      })
      expect(sendMessageMock).toHaveBeenCalledWith({
        type: 'CANCEL_LLM_REQUEST',
        requestId: id2,
      })
    })

    it('should clear all active requests', () => {
      manager.trackRequest('req_1')
      manager.trackRequest('req_2')
      manager.trackRequest('req_3')

      manager.cancelAll()

      expect(manager.getActiveRequests()).toEqual([])
      expect(manager.getActiveCount()).toBe(0)
    })

    it('should handle cancelling when no active requests', () => {
      expect(() => manager.cancelAll()).not.toThrow()
      expect(manager.getActiveCount()).toBe(0)
    })
  })

  describe('dispose', () => {
    it('should cancel all active requests on dispose', () => {
      const id1 = 'req_1'
      const id2 = 'req_2'

      manager.trackRequest(id1)
      manager.trackRequest(id2)

      manager.dispose()

      expect(manager.getActiveCount()).toBe(0)
      expect(sendMessageMock).toHaveBeenCalledTimes(2)
    })

    it('should be callable multiple times', () => {
      manager.trackRequest('req_1')

      manager.dispose()
      manager.dispose() // Second dispose

      expect(() => manager.dispose()).not.toThrow()
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete request lifecycle', () => {
      const requestId = manager.generateRequestId()

      // Track
      manager.trackRequest(requestId)
      expect(manager.isRequestActive(requestId)).toBe(true)
      expect(manager.getActiveCount()).toBe(1)

      // Remove
      manager.removeRequest(requestId)
      expect(manager.isRequestActive(requestId)).toBe(false)
      expect(manager.getActiveCount()).toBe(0)
    })

    it('should handle multiple concurrent requests', () => {
      const ids = Array.from({ length: 10 }, () => manager.generateRequestId())

      // Track all
      ids.forEach(id => manager.trackRequest(id))
      expect(manager.getActiveCount()).toBe(10)

      // Remove some
      manager.removeRequest(ids[0])
      manager.removeRequest(ids[2])
      manager.removeRequest(ids[4])
      expect(manager.getActiveCount()).toBe(7)

      // Cancel all
      manager.cancelAll()
      expect(manager.getActiveCount()).toBe(0)
    })

    it('should maintain request counter after operations', () => {
      const id1 = manager.generateRequestId()
      manager.trackRequest(id1)
      manager.removeRequest(id1)

      const id2 = manager.generateRequestId()
      manager.trackRequest(id2)
      manager.cancelRequest(id2)

      // Counter should keep incrementing
      const counter1 = parseInt(id1.split('_')[2])
      const counter2 = parseInt(id2.split('_')[2])
      expect(counter2).toBeGreaterThan(counter1)
    })
  })

  describe('createRequestManager', () => {
    it('should create a new RequestManager instance', () => {
      const manager1 = createRequestManager()
      const manager2 = createRequestManager()

      expect(manager1).not.toBe(manager2)
      expect(manager1).toBeInstanceOf(Object)
    })

    it('should create independent managers', () => {
      const manager1 = createRequestManager()
      const manager2 = createRequestManager()

      const id = manager1.generateRequestId()
      manager1.trackRequest(id)

      expect(manager1.getActiveCount()).toBe(1)
      expect(manager2.getActiveCount()).toBe(0)
    })
  })
})
