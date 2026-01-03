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
import { vocabularyState } from '@/shared/services/vocabularyState'

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

const GRAMMAR_PROMPT = `You are an expert English teacher. Analyze the following text.

## CRITICAL RULE - MUST FOLLOW
**ONLY select words from "Available Words to Explain" list. DO NOT select any other words.**

If "Available Words to Explain" is empty or contains only simple words within user's vocabulary level, return "vocabulary": []

## Context
- User Vocabulary Level: {vocabularyLevel} (~{wordCount} words)
- Words User is Learning: {unknownWords}
- Available Words to Explain: {filteredWords}

## STRICT SELECTION RULES
1. You MUST ONLY choose words from "Available Words to Explain"
2. Do NOT explain: reached, december, months, numbers, basic verbs
3. If filteredWords = ["repository", "deprecated", "vue"], ONLY choose from these 3
4. Prioritize: words in "Words User is Learning" list > words with frequency rank > {wordCount}

## Negative Examples - DO NOT DO THIS
❌ WRONG: Available Words = ["repository", "vue"], you explain "reached" (NOT in list!)
❌ WRONG: Available Words = ["repository"], you explain "deprecated" (NOT in list!)
❌ WRONG: Available Words = [], you still return vocabulary with words
❌ WRONG: Explaining simple words like: get, make, go, see, come, take, use, know, think, want, look, give, find, tell, ask, work, seem, feel, try, leave, call, good, bad, big, small, old, new, first, last, long, short, high, low, right, wrong

## Positive Examples - DO THIS INSTEAD
✅ CORRECT: Available Words = [] → vocabulary: []
✅ CORRECT: Available Words = ["repository", "deprecated"] → vocabulary: [{"word": "repository", "simpleDefinition": "...", "chineseTranslation": "..."}, {"word": "deprecated", "simpleDefinition": "...", "chineseTranslation": "..."}]
✅ CORRECT: Available Words = ["cat", "run"] with user level 2000 → vocabulary: [] (these are simple)

## Task 1: Grammar Marking
Wrap subject, predicate, object with tags:
- <subject>...</subject>
- <predicate>...</predicate>
- <object>...</object>

## Task 2: Vocabulary Explanation
ONLY select from: {filteredWords}

For each word:
- simpleDefinition: Simple English explanation using basic words (top 2000)
- chineseTranslation: Accurate Chinese translation
- If definition still has hard words, add Chinese in parentheses: "a place (地方) to keep things"

Return 5-8 most difficult words from the list, or fewer if list is small. Return [] if all are simple.

## Task 3: Translation
Translate to Chinese. For technical content, keep terms like Vue, React, API in English.

## Output Format
Return EXACTLY this JSON structure:

{
  "markedText": "The <subject>repository</subject> <predicate>is</predicate> <object>old</object>.",
  "vocabulary": [
    {
      "word": "repository",
      "simpleDefinition": "a place where things are stored or kept",
      "chineseTranslation": "仓库"
    }
  ],
  "translation": "这个仓库很旧。"
}

**If no difficult words:**
{
  "markedText": "The <subject>cat</subject> <predicate>is</predicate> <object>cute</object>.",
  "vocabulary": [],
  "translation": "这只猫很可爱。"
}

Text: {text}`

// 简化版 prompt - 当没有需要分析的单词时使用
const SIMPLE_PROMPT = `Analyze this text. No vocabulary explanation needed - return empty array.

Mark grammar with <subject>, <predicate>, <object> tags.
Translate to Chinese (keep technical terms in English).

Return JSON: {"markedText": "...", "vocabulary": [], "translation": "..."}

Text: {text}`

/**
 * Extract words from text (excluding punctuation and numbers)
 */
function extractWords(text: string): string[] {
  // Match words including contractions (e.g., "don't", "it's")
  const words = text.match(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g) || []
  return words.map((w) => w.toLowerCase())
}

/**
 * Build grammar analysis prompt with context
 */
async function buildGrammarPrompt(
  text: string,
  context: SimplifyContext
): Promise<string> {
  // 确保状态已初始化
  if (!vocabularyState.initialized) {
    await vocabularyState.init()
  }

  // 获取词汇量信息
  const level = vocabularyState.level
  const wordCount = parseInt(level.replace('LEVEL_', ''))

  // 从全局状态获取不认识的单词列表（限制数量）
  const unknownWords = vocabularyState.unknownWordsList.slice(0, 50)

  // 从文本中提取所有单词
  const allWords = extractWords(text)

  // 过滤：移除已认识的单词、常见功能词、标点符号
  const commonFunctionWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'this',
    'that',
    'these',
    'those',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'my',
    'your',
    'his',
    'her',
    'its',
    'our',
    'their',
  ])

  // 获取已认识的单词集合
  const knownWordsSet = new Set(vocabularyState.knownWordsList)

  // 过滤后的单词列表
  const filteredWords = Array.from(
    new Set(
      allWords.filter(
        (word) =>
          word.length > 1 && // 单字母单词除外
          !commonFunctionWords.has(word) && // 不是常见功能词
          !knownWordsSet.has(word) && // 不是已认识的单词
          !/^\d+$/.test(word) // 不是纯数字
      )
    )
  ).slice(0, 200) // 限制最多200个单词

  // 如果没有需要分析的单词，使用简化版 prompt
  if (filteredWords.length === 0) {
    return SIMPLE_PROMPT.replace('{text}', text)
  }

  // 否则使用完整的分析 prompt
  return GRAMMAR_PROMPT.replace('{pageUrl}', context.pageUrl || 'Not provided')
    .replace('{pageTitle}', context.pageTitle || 'Not provided')
    .replace('{pageDescription}', context.pageDescription || 'Not provided')
    .replace('{vocabularyLevel}', level)
    .replace('{wordCount}', wordCount.toString())
    .replace(
      '{unknownWords}',
      unknownWords.length > 0 ? unknownWords.join(', ') : 'None'
    )
    .replace('{filteredWords}', filteredWords.join(', '))
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
    const prompt = await buildGrammarPrompt(originalText, context)

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
