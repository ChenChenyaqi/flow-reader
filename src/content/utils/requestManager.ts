import type { CancelLLMRequestMessage } from '@/shared/types/llm'

// Local type declarations for Chrome runtime API
declare const chrome: {
  runtime: {
    sendMessage(message: unknown): void
  }
}

/**
 * Request Manager - Manages LLM request lifecycle
 *
 * Handles:
 * - Request ID generation
 * - Active request tracking
 * - Request cancellation
 */
class RequestManager {
  private activeRequests = new Set<string>()
  private requestCounter = 0

  /**
   * Generate unique request ID
   */
  generateRequestId(): string {
    this.requestCounter++
    return `req_${Date.now()}_${this.requestCounter}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Track a new request
   */
  trackRequest(requestId: string): void {
    this.activeRequests.add(requestId)
  }

  /**
   * Remove a request from tracking
   */
  removeRequest(requestId: string): void {
    this.activeRequests.delete(requestId)
  }

  /**
   * Check if a request is still active
   */
  isRequestActive(requestId: string): boolean {
    return this.activeRequests.has(requestId)
  }

  /**
   * Get all active request IDs
   */
  getActiveRequests(): string[] {
    return Array.from(this.activeRequests)
  }

  /**
   * Get count of active requests
   */
  getActiveCount(): number {
    return this.activeRequests.size
  }

  /**
   * Cancel a specific request
   */
  cancelRequest(requestId: string): void {
    const cancelMessage: CancelLLMRequestMessage = {
      type: 'CANCEL_LLM_REQUEST',
      requestId,
    }
    chrome.runtime.sendMessage(cancelMessage)
    this.removeRequest(requestId)
  }

  /**
   * Cancel all active requests
   */
  cancelAll(): void {
    this.activeRequests.forEach(requestId => {
      const cancelMessage: CancelLLMRequestMessage = {
        type: 'CANCEL_LLM_REQUEST',
        requestId,
      }
      chrome.runtime.sendMessage(cancelMessage)
    })
    this.activeRequests.clear()
  }

  /**
   * Clean up all requests (use on unmount)
   */
  dispose(): void {
    this.cancelAll()
  }
}

/**
 * Create a RequestManager instance
 */
export function createRequestManager(): RequestManager {
  return new RequestManager()
}
