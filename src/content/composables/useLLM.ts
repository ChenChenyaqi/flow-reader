import { ref, onUnmounted } from 'vue'
import type {
  LLMMessage,
  LLMRequestMessage,
  LLMStreamChunkMessage,
  LLMResponseMessage,
  SimplifyContext,
  GrammarAnalysis,
  GrammarAnalysisRequestMessage,
  GrammarAnalysisResponseMessage,
  CancelLLMRequestMessage,
} from '@/shared/types/llm'

// Chrome runtime types
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
    lastError?: { message: string }
  }
}

const SYSTEM_PROMPT = `You are an expert English teacher for absolute beginners. Your task is to rewrite complex English sentences into simple, easy-to-understand English.

## Context Information
- Page URL: {pageUrl || 'Not provided'}
- Page Title: {pageTitle || 'Not provided'}
- Page Description: {pageDescription || 'Not provided'}

## Guidelines

### For Technical/Documentation Content:
If the URL or title indicates this is technical documentation, tutorial, or code-related content:
- **KEEP technical terms unchanged**: Vue, React, component, props, API, repository, framework, etc.
- Only simplify sentence structure and non-technical vocabulary
- Break complex sentences into 2-3 shorter simple sentences
- Use active voice, avoid passive voice

### For General Content:
- Use ONLY the most common 1,000-2,000 English words
- Replace advanced vocabulary with basic alternatives (e.g., "utilize" → "use", "examine" → "look at")
- Break complex sentences into 2-3 shorter simple sentences if needed
- Use active voice, avoid passive voice
- Avoid idioms, phrasal verbs, and complex grammar
- Target reading level: 3rd-5th grade (A1-A2 CEFR level)

## Universal Rules:
- Keep the same meaning as the original
- If any uncommon words remain in the simplified sentence, annotate them with Chinese translation in parentheses, e.g., "The repository (仓库) is old"
- Output ONLY the simplified English sentence(s). No explanations.`

/**
 * Build system prompt with context
 */
function buildSystemPrompt(context: SimplifyContext): string {
  return SYSTEM_PROMPT
    .replace('{pageUrl || \'Not provided\'}', context.pageUrl || 'Not provided')
    .replace('{pageTitle || \'Not provided\'}', context.pageTitle || 'Not provided')
    .replace('{pageDescription || \'Not provided\'}', context.pageDescription || 'Not provided')
}

const GRAMMAR_PROMPT = `Analyze the following English text comprehensively.

## Context Information
- Page URL: {pageUrl || 'Not provided'}
- Page Title: {pageTitle || 'Not provided'}
- Page Description: {pageDescription || 'Not provided'}

## Task 1: Grammar Marking
Wrap subject, predicate, and object with HTML tags:
- <subject>...</subject> for subject
- <predicate>...</predicate> for predicate (verb)
- <object>...</object> for object

Example: "The <subject>repository</subject> <predicate>is</predicate> <object>old</object>."

## Task 2: Vocabulary Explanation
Identify 5-8 difficult/uncommon words or phrases:
- For technical docs: Keep terms like Vue, React, API, etc.
- Focus on advanced vocabulary, idioms, phrasal verbs
- Provide simple definition using basic words (top 2000 common words)
- If the definition still contains uncommon words, annotate them with Chinese translation in parentheses, e.g., "a facility (设施) where things are kept"
- Provide accurate Chinese translation for the main word

## Task 3: Full Translation
Translate to Chinese considering context:
- For technical docs: Keep technical terms in English
- For general content: Full Chinese translation
- Use natural, simple Chinese

Return ONLY a valid JSON in this exact format:

{
  "markedText": "The <subject>repository</subject> <predicate>is</predicate> <object>old</object>.",
  "vocabulary": [
    {
      "word": "repository",
      "simpleDefinition": "a facility (设施) where things are stored or kept",
      "chineseTranslation": "仓库"
    }
  ],
  "translation": "这个仓库很旧。"
}

Rules:
- Keep original text exactly, only add tags
- Handle multiple sentences and clauses
- Mark all subjects/predicates/objects
- Tags must not overlap
- Limit vocabulary to 5-8 most important items

Text to analyze:
{text}`

/**
 * Build grammar analysis prompt with context
 */
function buildGrammarPrompt(text: string, context: SimplifyContext): string {
  return GRAMMAR_PROMPT
    .replace('{pageUrl || \'Not provided\'}', context.pageUrl || 'Not provided')
    .replace('{pageTitle || \'Not provided\'}', context.pageTitle || 'Not provided')
    .replace('{pageDescription || \'Not provided\'}', context.pageDescription || 'Not provided')
    .replace('{text}', text)
}

export function useLLM() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Non-streaming response data
  const responseText = ref<string | null>(null)

  // Streaming response data
  const streamingText = ref<string>('')

  // Simplify functionality
  const simplifiedText = ref<string>('')
  const simplifyLoading = ref(false)

  // Grammar analysis functionality
  const grammarAnalysis = ref<GrammarAnalysis | null>(null)
  const grammarLoading = ref(false)

  // Listener cleanup function
  let messageListener:
    | ((message: unknown, sender: unknown, sendResponse: (response?: unknown) => void) => void)
    | null = null

  // Track active request IDs for cancellation
  const activeRequestIds = ref<string[]>([])

  /**
   * Generate unique request ID
   */
  function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Cancel all pending requests
   */
  function cancelPendingRequests() {
    activeRequestIds.value.forEach(requestId => {
      const cancelMessage: CancelLLMRequestMessage = {
        type: 'CANCEL_LLM_REQUEST',
        requestId,
      }
      chrome.runtime.sendMessage(cancelMessage)
    })
    activeRequestIds.value = []
  }

  /**
   * Send chat request with streaming or non-streaming mode
   * @param messages - Array of chat messages
   * @param options - Request options
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
    // Generate unique request ID
    const requestId = generateRequestId()
    activeRequestIds.value.push(requestId)

    // Reset state
    loading.value = true
    error.value = null
    responseText.value = null
    streamingText.value = ''

    try {
      const requestMessage: LLMRequestMessage = {
        type: 'LLM_REQUEST',
        requestId,
        stream: options.stream ?? false,
        messages,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      }

      // Streaming mode
      if (requestMessage.stream) {
        return await handleStreamingRequest(requestMessage, options.onChunk)
      }

      // Non-streaming mode
      return await handleNonStreamingRequest(requestMessage)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Request failed'
      return null
    } finally {
      // Remove request ID from active list
      const index = activeRequestIds.value.indexOf(requestId)
      if (index > -1) {
        activeRequestIds.value.splice(index, 1)
      }
      loading.value = false
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
      // Check if request was already cancelled
      if (!activeRequestIds.value.includes(request.requestId)) {
        reject(new Error('Request was cancelled'))
        return
      }

      // Set up message listener for streaming chunks
      messageListener = (message: unknown) => {
        const chunkMessage = message as LLMStreamChunkMessage

        if (chunkMessage.type === 'LLM_STREAM_CHUNK') {
          if (chunkMessage.done) {
            // Streaming completed
            cleanup()
            resolve(streamingText.value)
          } else if (chunkMessage.chunk) {
            // Append chunk and trigger callback
            streamingText.value += chunkMessage.chunk
            onChunk?.(chunkMessage.chunk, streamingText.value)
          }
        }
      }

      chrome.runtime.onMessage.addListener(messageListener)

      // Send request to background
      chrome.runtime.sendMessage(request, (response) => {
        if (chrome.runtime.lastError) {
          cleanup()
          reject(new Error(chrome.runtime.lastError.message))
        } else if (response && typeof response === 'object' && 'error' in response) {
          cleanup()
          reject(new Error(response.error as string))
        }
      })
    })
  }

  /**
   * Handle non-streaming request
   */
  async function handleNonStreamingRequest(request: LLMRequestMessage): Promise<string | null> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(request, response => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }

        const responseMessage = response as LLMResponseMessage

        if (!responseMessage) {
          reject(new Error('No response from background'))
          return
        }

        if (responseMessage.error) {
          reject(new Error(responseMessage.error))
          return
        }

        const data = responseMessage.response

        // Response is now always a string
        if (typeof data === 'string') {
          responseText.value = data
          resolve(data)
        } else {
          resolve(null)
        }
      })
    })
  }

  /**
   * Simplify text using streaming mode
   * @param text - Original text to simplify
   * @param context - Page context information
   * @param options - Request options
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
      error.value = 'Please provide text to simplify'
      return null
    }

    // Cancel any pending requests before starting new one
    cancelPendingRequests()

    simplifyLoading.value = true
    error.value = null
    simplifiedText.value = ''
    grammarAnalysis.value = null

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
        onChunk: (chunk: string, fullText: string) => {
          // Update simplified text in real-time for typewriter effect
          simplifiedText.value = fullText
          // Call external callback if provided
          options.onChunk?.(chunk, fullText)
        },
      })

      // Trigger grammar analysis in parallel (non-blocking)
      analyzeGrammar(text, context).catch(err => {
        console.error('Grammar analysis failed:', err)
      })

      return simplifiedText.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Simplification failed'
      return null
    } finally {
      simplifyLoading.value = false
    }
  }

  /**
   * Analyze grammar structure (non-streaming)
   * @param originalText - Original text to analyze
   * @param context - Page context information
   * @returns Grammar analysis with S-P-O spans
   */
  async function analyzeGrammar(
    originalText: string,
    context: SimplifyContext = {}
  ): Promise<GrammarAnalysis | null> {
    if (!originalText || originalText.trim() === '') {
      error.value = 'Please provide text to analyze'
      return null
    }

    // Generate unique request ID
    const requestId = generateRequestId()
    activeRequestIds.value.push(requestId)

    grammarLoading.value = true
    error.value = null

    // Build prompt with context
    const prompt = buildGrammarPrompt(originalText, context)

    const messages: LLMMessage[] = [{ role: 'user', content: prompt }]

    return new Promise<GrammarAnalysis | null>((resolve, reject) => {
      const requestMessage: GrammarAnalysisRequestMessage = {
        type: 'GRAMMAR_ANALYSIS_REQUEST',
        requestId,
        messages,
      }

      chrome.runtime.sendMessage(requestMessage, response => {
        // Remove request ID from active list
        const index = activeRequestIds.value.indexOf(requestId)
        if (index > -1) {
          activeRequestIds.value.splice(index, 1)
        }

        if (chrome.runtime.lastError) {
          error.value = chrome.runtime.lastError.message
          reject(new Error(chrome.runtime.lastError.message))
          return
        }

        const responseMessage = response as GrammarAnalysisResponseMessage

        if (!responseMessage) {
          error.value = 'No response from background'
          reject(new Error('No response from background'))
          return
        }

        if (responseMessage.error) {
          error.value = responseMessage.error
          reject(new Error(responseMessage.error))
          return
        }

        grammarAnalysis.value = responseMessage.analysis
        resolve(responseMessage.analysis)
      })
    }).catch(err => {
      error.value = err instanceof Error ? err.message : 'Grammar analysis failed'
      return null
    }).finally(() => {
      grammarLoading.value = false
    })
  }

  /**
   * Clean up message listener
   */
  function cleanup() {
    if (messageListener) {
      chrome.runtime.onMessage.removeListener(messageListener)
      messageListener = null
    }
  }

  /**
   * Reset all state
   */
  function reset() {
    cancelPendingRequests()
    cleanup()
    loading.value = false
    error.value = null
    responseText.value = null
    streamingText.value = ''
    simplifiedText.value = ''
    simplifyLoading.value = false
    grammarAnalysis.value = null
    grammarLoading.value = false
  }

  // Clean up on unmount
  onUnmounted(() => {
    cancelPendingRequests()
    cleanup()
  })

  return {
    loading,
    error,
    responseText,
    streamingText,
    simplifiedText,
    simplifyLoading,
    chat,
    simplify,
    reset,
    grammarAnalysis,
    grammarLoading,
    analyzeGrammar,
    cancelPendingRequests,
  }
}
