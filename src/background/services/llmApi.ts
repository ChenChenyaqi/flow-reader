import OpenAI from 'openai'
import type {
  LLMConfig,
  LLMRequestOptions,
  StreamCallback,
  GrammarAnalysis,
  LLMMessage,
} from '@/shared/types/llm'

class LLMApiService {
  /**
   * Get base URL for provider
   */
  private getBaseURL(config: LLMConfig): string {
    switch (config.provider) {
      case 'openai':
        return 'https://api.openai.com/v1'
      case 'zhipu':
        return 'https://open.bigmodel.cn/api/paas/v4'
      case 'custom':
        return config.apiUrl!
      default:
        throw new Error(`Unsupported provider: ${config.provider}`)
    }
  }

  /**
   * Get OpenAI client instance
   */
  private getClient(config: LLMConfig): OpenAI {
    return new OpenAI({
      apiKey: config.apiKey,
      baseURL: this.getBaseURL(config),
    })
  }

  /**
   * Stream text from LLM with real-time chunk callbacks
   * @param config - LLM configuration
   * @param options - Request options
   * @param onChunk - Callback for each text chunk
   * @param signal - AbortSignal for cancellation
   * @returns Complete text when finished
   */
  async streamRequest(
    config: LLMConfig,
    options: LLMRequestOptions,
    onChunk?: StreamCallback,
    signal?: AbortSignal
  ): Promise<string> {
    const client = this.getClient(config)

    const stream: any = await client.chat.completions.create(
      {
        model: config.model,
        messages: options.messages,
        temperature: options.temperature ?? config.temperature ?? 0.7,
        stream: true,
        thinking: {
          type: 'disabled',
        },
      } as any,
      {
        signal,
      } as any
    )

    let fullText = ''

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta || {}
      // Only use content field, ignore reasoning_content (internal thinking process)
      const content = delta.content || ''

      if (content) {
        fullText += content
        onChunk?.(content)
      }
    }

    return fullText
  }

  /**
   * Generate text without streaming (for future use)
   */
  async generateRequest(
    config: LLMConfig,
    options: LLMRequestOptions,
    signal?: AbortSignal
  ): Promise<string> {
    const client = this.getClient(config)

    const response = await client.chat.completions.create(
      {
        model: config.model,
        messages: options.messages,
        temperature: options.temperature ?? config.temperature ?? 0.7,
        stream: false,
        thinking: {
          type: 'disabled',
        },
      } as any,
      {
        signal,
      } as any
    )

    return response.choices[0]?.message?.content || ''
  }

  /**
   * Analyze sentence structure (subject-predicate-object)
   * @param config - LLM configuration
   * @param messages - Messages including the text to analyze
   * @param signal - AbortSignal for cancellation
   * @returns Grammar analysis with marked text, vocabulary, and translation
   */
  async analyzeGrammar(
    config: LLMConfig,
    messages: LLMMessage[],
    signal?: AbortSignal
  ): Promise<GrammarAnalysis> {
    const client = this.getClient(config)

    const response = await client.chat.completions.create(
      {
        model: config.model,
        messages,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        thinking: {
          type: 'disabled',
        },
      } as any,
      {
        signal,
      } as any
    )

    const content =
      response.choices[0]?.message?.content || '{"markedText":"","vocabulary":[],"translation":""}'
    return JSON.parse(content) as GrammarAnalysis
  }
}

export const llmApiService = new LLMApiService()
