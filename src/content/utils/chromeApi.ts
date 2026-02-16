// Local type declarations for Chrome runtime API
type MessageListener = (
  message: unknown,
  sender: unknown,
  sendResponse: (response?: unknown) => void
) => void

declare const chrome: {
  runtime: {
    sendMessage(message: unknown, callback?: (response: unknown) => void): void
    onMessage: {
      addListener(callback: MessageListener): void
      removeListener(callback: MessageListener): void
    }
    lastError?: { message?: string }
  }
}

/**
 * Chrome API Adapter - Provides a clean interface for Chrome Extension APIs
 *
 * This adapter:
 * - Encapsulates Chrome Extension API calls
 * - Makes testing easier by providing mockable interface
 * - Provides consistent error handling
 */

/**
 * Send a message to the background script
 */
export function sendMessage(message: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: unknown) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message ?? 'Unknown Chrome error'))
        return
      }
      resolve(response)
    })
  })
}

/**
 * Send a message without waiting for response (fire and forget)
 */
export function sendMessageNoResponse(message: unknown): void {
  chrome.runtime.sendMessage(message)
}

/**
 * Message Listener Manager
 */
export class MessageListenerManager {
  private listener: MessageListener | null = null
  private isActive = false

  /**
   * Add a message listener
   */
  addListener(listener: MessageListener): void {
    if (this.isActive) {
      console.warn('[MessageListenerManager] Listener already active, replacing it')
      this.remove()
    }

    this.listener = listener
    chrome.runtime.onMessage.addListener(listener)
    this.isActive = true
  }

  /**
   * Remove the message listener
   */
  remove(): void {
    if (this.listener && this.isActive) {
      chrome.runtime.onMessage.removeListener(this.listener)
      this.listener = null
      this.isActive = false
    }
  }

  /**
   * Check if listener is active
   */
  get active(): boolean {
    return this.isActive
  }

  /**
   * Clean up on unmount
   */
  dispose(): void {
    this.remove()
  }
}

/**
 * Create a message listener manager
 */
export function createMessageListenerManager(): MessageListenerManager {
  return new MessageListenerManager()
}
