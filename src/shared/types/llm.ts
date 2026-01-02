export enum LLMProvider {
  ZHIPU = 'zhipu',
  OPENAI = 'openai',
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

export interface GrammarAnalysis {
  markedText: string // Text with <role>...</role> markers
  vocabulary: VocabularyItem[] // Difficult words
  translation: string // Full translation
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
