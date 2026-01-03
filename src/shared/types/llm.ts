export enum LLMProvider {
  // Domestic LLMs (OpenAI-compatible)
  ZHIPU = 'zhipu',      // 智谱 AI
  DOUBAO = 'doubao',    // 豆包 (字节跳动)
  QIANWEN = 'qianwen',  // 通义千问 (阿里云)
  DEEPSEEK = 'deepseek', // DeepSeek
  MOONSHOT = 'moonshot', // Moonshot AI (Kimi)

  // International LLMs
  OPENAI = 'openai',    // OpenAI
  GROQ = 'groq',        // Groq

  // Custom
  CUSTOM = 'custom',
}

export interface LLMConfig {
  provider: LLMProvider
  apiKey: string
  apiUrl?: string
  model: string
  maxTokens?: number
  temperature?: number
}

// Multi-config storage format
export interface MultiLLMConfig {
  currentProvider: LLMProvider
  configs: Partial<Record<LLMProvider, LLMConfig>>
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMRequestOptions {
  stream?: boolean
  messages: LLMMessage[]
  temperature?: number
  maxTokens?: number
}

export type StreamCallback = (chunk: string) => void

// Message types for Chrome extension communication
export interface LLMRequestMessage {
  type: 'LLM_REQUEST'
  requestId: string
  stream: boolean
  messages: LLMMessage[]
  temperature?: number
  maxTokens?: number
}

export interface CancelLLMRequestMessage {
  type: 'CANCEL_LLM_REQUEST'
  requestId: string
}

export interface LLMStreamChunkMessage {
  type: 'LLM_STREAM_CHUNK'
  chunk: string
  done: boolean
}

export interface SimplifyContext {
  pageUrl?: string
  pageTitle?: string
  pageDescription?: string
}

export interface LLMResponseMessage {
  type: 'LLM_RESPONSE'
  response: string
  error?: string
}

// Grammar analysis types
export type GrammarRole = 'subject' | 'predicate' | 'object'

export interface VocabularyItem {
  word: string
  simpleDefinition: string
  chineseTranslation: string
}

// Confidence rating
export interface Confidence {
  score: number // 0-100
  level: 'high' | 'medium' | 'low'
}

export interface GrammarAnalysis {
  markedText: string // Text with <role>...</role> markers
  vocabulary: VocabularyItem[] // Difficult words
  translation: string // Full translation
  confidence?: Confidence // Analysis confidence
}

export interface GrammarAnalysisRequestMessage {
  type: 'GRAMMAR_ANALYSIS_REQUEST'
  requestId: string
  messages: LLMMessage[]
}

export interface GrammarAnalysisResponseMessage {
  type: 'GRAMMAR_ANALYSIS_RESPONSE'
  analysis: GrammarAnalysis | null
  error?: string
}
