import { computed, reactive, onUnmounted } from 'vue'
import type {
  LLMMessage,
  LLMRequestMessage,
  LLMStreamChunkMessage,
  LLMResponseMessage,
  SimplifyContext,
  GrammarAnalysis,
  GrammarAnalysisRequestMessage,
  GrammarAnalysisResponseMessage,
} from '@/shared/types/llm'
import { buildSystemPrompt } from '../prompts/simplifyPrompt'
import { buildGrammarPrompt } from '../prompts/grammarPrompt'
import { createRequestManager } from '../utils/requestManager'
import { createMessageListenerManager, sendMessage } from '../utils/chromeApi'
import { createErrorHandler, LLMErrorType } from '../utils/errorHandler'

// Local type declarations for Chrome runtime API (for direct use in streaming)
declare const chrome: {
  runtime: {
    sendMessage(message: unknown, callback?: (response: unknown) => void): void
    onMessage: {
      addListener(
        callback: (
          message: unknown,
          sender: unknown,
          sendResponse: (response?: unknown) => void
        ) => void
      ): void
      removeListener(
        callback: (
          message: unknown,
          sender: unknown,
          sendResponse: (response?: unknown) => void
        ) => void
      ): void
    }
    lastError?: { message?: string }
  }
}

// Type guard for LLMStreamChunkMessage
function isStreamChunkMessage(message: unknown): message is LLMStreamChunkMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    message.type === 'LLM_STREAM_CHUNK'
  )
}

// Type guard for error response
function isErrorResponse(response: unknown): response is { error: string } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof response.error === 'string'
  )
}

// Type guard for LLMResponseMessage
function isLLMResponseMessage(response: unknown): response is LLMResponseMessage {
  return (
    typeof response === 'object' &&
    response !== null &&
    'type' in response &&
    'response' in response
  )
}

// Type guard for GrammarAnalysisResponseMessage
function isGrammarAnalysisResponse(response: unknown): response is GrammarAnalysisResponseMessage {
  return (
    typeof response === 'object' &&
    response !== null &&
    'type' in response &&
    'analysis' in response
  )
}

/**
 * LLM Composable - Manages LLM interactions
 *
 * Provides:
 * - Text simplification with streaming
 * - Grammar analysis
 * - Request lifecycle management
 * - Unified error handling
 */
export function useLLM() {
  // Request management
  const requestManager = createRequestManager()
  const listenerManager = createMessageListenerManager()

  // State organized by functionality
  const state = reactive({
    // Loading states
    simplifyLoading: false,
    grammarLoading: false,

    // Error state
    error: null as string | null,

    // Response data
    streamingText: '',
    simplifiedText: '',
    grammarAnalysis: null as GrammarAnalysis | null,
  })

  // Error handler
  const handleError = createErrorHandler(message => {
    state.error = message
  })

  /**
   * Reset all loading states
   */
  function resetLoadingStates() {
    state.simplifyLoading = false
    state.grammarLoading = false
  }

  /**
   * Reset response data
   */
  function resetResponseData() {
    state.streamingText = ''
    state.simplifiedText = ''
    state.grammarAnalysis = null
  }

  /**
   * Send chat request with streaming or non-streaming mode
   */
  async function chat(
    messages: LLMMessage[],
    options: {
      stream?: boolean
      temperature?: number
      maxTokens?: number
      onChunk?: (chunk: string, fullText: string) => void
    } = {}
  ): Promise<string | null> {
    const requestId = requestManager.generateRequestId()
    requestManager.trackRequest(requestId)

    // Reset state
    state.error = null
    state.streamingText = ''

    try {
      const requestMessage: LLMRequestMessage = {
        type: 'LLM_REQUEST',
        requestId,
        stream: options.stream ?? false,
        messages,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      }

      if (requestMessage.stream) {
        return await handleStreamingRequest(requestMessage, options.onChunk)
      }

      return await handleNonStreamingRequest(requestMessage)
    } catch (err) {
      handleError(err)
      return null
    } finally {
      requestManager.removeRequest(requestId)
    }
  }

  /**
   * Handle streaming request
   */
  async function handleStreamingRequest(
    request: LLMRequestMessage,
    onChunk?: (chunk: string, fullText: string) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!requestManager.isRequestActive(request.requestId)) {
        reject(new Error('Request was cancelled'))
        return
      }

      // Set up message listener
      listenerManager.addListener((message: unknown) => {
        if (!isStreamChunkMessage(message)) return

        if (message.done) {
          listenerManager.remove()
          resolve(state.streamingText)
        } else if (message.chunk) {
          state.streamingText += message.chunk
          onChunk?.(message.chunk, state.streamingText)
        }
      })

      // Send request
      chrome.runtime.sendMessage(request, (response: unknown) => {
        if (chrome.runtime.lastError) {
          listenerManager.remove()
          reject(new Error(chrome.runtime.lastError.message ?? 'Unknown error'))
        } else if (isErrorResponse(response)) {
          listenerManager.remove()
          reject(new Error(response.error))
        }
      })
    })
  }

  /**
   * Handle non-streaming request
   */
  async function handleNonStreamingRequest(request: LLMRequestMessage): Promise<string | null> {
    try {
      const response = await sendMessage(request)

      if (!isLLMResponseMessage(response)) {
        throw new Error('Invalid response format')
      }

      if (response.error) {
        throw new Error(response.error)
      }

      const data = response.response

      if (typeof data === 'string') {
        return data
      }

      return null
    } catch (err) {
      throw err
    }
  }

  /**
   * Simplify text using streaming mode
   */
  async function simplify(
    text: string,
    context: SimplifyContext = {},
    options: {
      stream?: boolean
      onChunk?: (chunk: string, fullText: string) => void
    } = {}
  ): Promise<string | null> {
    if (!text || text.trim() === '') {
      handleError(new Error(LLMErrorType.EMPTY_TEXT))
      return null
    }

    // Cancel any pending requests
    requestManager.cancelAll()

    state.simplifyLoading = true
    state.error = null
    state.simplifiedText = ''

    try {
      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: buildSystemPrompt(context),
        },
        {
          role: 'user',
          content: text,
        },
      ]

      await chat(messages, {
        stream: options.stream ?? true,
        onChunk: (_chunk: string, fullText: string) => {
          state.simplifiedText = fullText
          options.onChunk?.(_chunk, fullText)
        },
      })

      return state.simplifiedText
    } catch (err) {
      handleError(err)
      return null
    } finally {
      state.simplifyLoading = false
    }
  }

  /**
   * Analyze grammar structure (non-streaming)
   */
  async function analyzeGrammar(
    originalText: string,
    context: SimplifyContext = {}
  ): Promise<GrammarAnalysis | null> {
    if (!originalText || originalText.trim() === '') {
      handleError(new Error(LLMErrorType.EMPTY_TEXT))
      return null
    }

    const requestId = requestManager.generateRequestId()
    requestManager.trackRequest(requestId)

    state.grammarLoading = true
    state.grammarAnalysis = null
    state.error = null

    try {
      const prompt = await buildGrammarPrompt(originalText, context)
      const messages: LLMMessage[] = [{ role: 'user', content: prompt }]

      const requestMessage: GrammarAnalysisRequestMessage = {
        type: 'GRAMMAR_ANALYSIS_REQUEST',
        requestId,
        messages,
      }

      const response = await sendMessage(requestMessage)

      if (!isGrammarAnalysisResponse(response)) {
        throw new Error('Invalid response format')
      }

      if (response.error) {
        throw new Error(response.error)
      }

      state.grammarAnalysis = response.analysis
      return response.analysis
    } catch (err) {
      handleError(err)
      return null
    } finally {
      requestManager.removeRequest(requestId)
      state.grammarLoading = false
    }
  }

  /**
   * Cancel all pending requests
   */
  function cancelPendingRequests(): void {
    requestManager.cancelAll()
  }

  /**
   * Reset all state
   */
  function reset(): void {
    cancelPendingRequests()
    listenerManager.dispose()
    resetLoadingStates()
    resetResponseData()
  }

  // Clean up on unmount
  onUnmounted(() => {
    reset()
  })

  return {
    // Loading states
    simplifyLoading: computed(() => state.simplifyLoading),
    grammarLoading: computed(() => state.grammarLoading),

    // Error state
    error: computed(() => state.error),

    // Response data
    simplifiedText: computed(() => state.simplifiedText),
    grammarAnalysis: computed(() => state.grammarAnalysis),

    // Methods
    simplify,
    analyzeGrammar,
    reset,
  }
}
