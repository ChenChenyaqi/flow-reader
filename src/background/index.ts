import { storage } from '../shared/services/storage'
import { llmApiService } from './services/llmApi'
import type {
  LLMRequestMessage,
  LLMStreamChunkMessage,
  LLMResponseMessage,
  GrammarAnalysisRequestMessage,
  GrammarAnalysisResponseMessage,
  CancelLLMRequestMessage,
} from '@/shared/types/llm'

// Store active AbortControllers for each request
const activeRequests = new Map<string, AbortController>()

chrome.runtime.onInstalled.addListener(() => {
  // Extension installed
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // New unified LLM request
  if (message.type === 'LLM_REQUEST') {
    const request = message as LLMRequestMessage
    handleLLMRequest(request, sender.tab?.id, sendResponse)
    return true
  }

  // Grammar analysis request
  if (message.type === 'GRAMMAR_ANALYSIS_REQUEST') {
    const request = message as GrammarAnalysisRequestMessage
    handleGrammarAnalysisRequest(request, sendResponse)
    return true
  }

  // Cancel request
  if (message.type === 'CANCEL_LLM_REQUEST') {
    const cancelRequest = message as CancelLLMRequestMessage
    handleCancelRequest(cancelRequest.requestId)
    return false
  }
})

/**
 * Handle cancel request
 */
function handleCancelRequest(requestId: string) {
  const controller = activeRequests.get(requestId)
  if (controller) {
    controller.abort()
    activeRequests.delete(requestId)
  }
}

/**
 * Unified LLM request handler supporting both streaming and non-streaming modes
 */
async function handleLLMRequest(
  request: LLMRequestMessage,
  tabId: number | undefined,
  sendResponse: (response: unknown) => void
) {
  // Create AbortController for this request
  const abortController = new AbortController()
  activeRequests.set(request.requestId, abortController)

  try {
    const config = await storage.getLLMConfig()

    if (!config) {
      sendResponse({ error: 'LLM configuration not found' })
      return
    }

    // Streaming mode
    if (request.stream) {
      if (!tabId) {
        sendResponse({ error: 'Unable to determine sender tab for streaming' })
        return
      }

      handleStreamingRequest(config, request, tabId, abortController.signal)
        .then(() => {
          // Send final completion message
          const finalMessage: LLMStreamChunkMessage = {
            type: 'LLM_STREAM_CHUNK',
            chunk: '',
            done: true,
          }
          chrome.tabs.sendMessage(tabId, finalMessage)
        })
        .catch((err) => {
          // Don't send error if aborted
          if (err.name !== 'AbortError') {
            const errorMessage: LLMStreamChunkMessage = {
              type: 'LLM_STREAM_CHUNK',
              chunk: '',
              done: true,
            }
            chrome.tabs.sendMessage(tabId, errorMessage)
          }
        })
        .finally(() => {
          activeRequests.delete(request.requestId)
        })

      // Send immediate response to keep message channel open
      sendResponse({ streaming: true })
      return
    }

    // Non-streaming mode: return full text response
    const result = await llmApiService.generateRequest(config, request, abortController.signal)

    const responseMessage: LLMResponseMessage = {
      type: 'LLM_RESPONSE',
      response: result,
    }

    sendResponse(responseMessage)
  } catch (error) {
    // Don't send error if aborted
    if (error instanceof Error && error.name !== 'AbortError') {
      sendResponse({
        type: 'LLM_RESPONSE',
        error: error.message,
      })
    }
  } finally {
    activeRequests.delete(request.requestId)
  }
}

/**
 * Handle grammar analysis request
 */
async function handleGrammarAnalysisRequest(
  request: GrammarAnalysisRequestMessage,
  sendResponse: (response: unknown) => void
) {
  // Create AbortController for this request
  const abortController = new AbortController()
  activeRequests.set(request.requestId, abortController)

  try {
    const config = await storage.getLLMConfig()

    if (!config) {
      sendResponse({
        type: 'GRAMMAR_ANALYSIS_RESPONSE',
        analysis: null,
        error: 'LLM configuration not found',
      })
      return
    }

    const analysis = await llmApiService.analyzeGrammar(config, request.messages, abortController.signal)

    const response: GrammarAnalysisResponseMessage = {
      type: 'GRAMMAR_ANALYSIS_RESPONSE',
      analysis,
    }

    sendResponse(response)
  } catch (error) {
    // Don't send error if aborted
    if (error instanceof Error && error.name !== 'AbortError') {
      sendResponse({
        type: 'GRAMMAR_ANALYSIS_RESPONSE',
        analysis: null,
        error: error.message,
      })
    }
  } finally {
    activeRequests.delete(request.requestId)
  }
}

/**
 * Handle streaming request and send chunks back to content script
 */
async function handleStreamingRequest(
  config: any,
  request: LLMRequestMessage,
  tabId: number,
  signal: AbortSignal
): Promise<void> {
  await llmApiService.streamRequest(config, request, (chunk: string) => {
    const chunkMessage: LLMStreamChunkMessage = {
      type: 'LLM_STREAM_CHUNK',
      chunk,
      done: false,
    }
    chrome.tabs.sendMessage(tabId, chunkMessage).catch(() => {
      // Ignore errors if tab was closed
    })
  }, signal)
}
