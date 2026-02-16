/**
 * Error types for LLM operations
 */
export enum LLMErrorType {
  NO_API_KEY = 'NO_API_KEY',
  INVALID_CONFIG = 'INVALID_CONFIG',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  REQUEST_CANCELLED = 'REQUEST_CANCELLED',
  EMPTY_TEXT = 'EMPTY_TEXT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error messages mapping
 */
const ERROR_MESSAGES: Record<LLMErrorType, string> = {
  [LLMErrorType.NO_API_KEY]: 'API key is not configured',
  [LLMErrorType.INVALID_CONFIG]: 'Invalid LLM configuration',
  [LLMErrorType.NETWORK_ERROR]: 'Network connection failed',
  [LLMErrorType.RATE_LIMIT]: 'API rate limit exceeded',
  [LLMErrorType.REQUEST_CANCELLED]: 'Request was cancelled',
  [LLMErrorType.EMPTY_TEXT]: 'Please provide text to process',
  [LLMErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred',
}

/**
 * Custom LLM Error class
 */
export class LLMError extends Error {
  constructor(
    public type: LLMErrorType,
    message?: string
  ) {
    super(message || ERROR_MESSAGES[type])
    this.name = 'LLMError'
  }
}

/**
 * Detect error type from error message or object
 */
export function detectErrorType(error: unknown): LLMErrorType {
  if (error instanceof LLMError) {
    return error.type
  }

  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('API key') || message.includes('401')) {
    return LLMErrorType.NO_API_KEY
  }
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('ECONNREFUSED')
  ) {
    return LLMErrorType.NETWORK_ERROR
  }
  if (message.includes('rate limit') || message.includes('429')) {
    return LLMErrorType.RATE_LIMIT
  }
  if (message.includes('cancelled') || message.includes('abort')) {
    return LLMErrorType.REQUEST_CANCELLED
  }

  return LLMErrorType.UNKNOWN_ERROR
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof LLMError) {
    return error.message
  }

  const errorType = detectErrorType(error)
  return ERROR_MESSAGES[errorType]
}

/**
 * Create error handler for async operations
 */
export function createErrorHandler(setError: (message: string | null) => void) {
  return function handleError(error: unknown): LLMError {
    const errorMessage = getErrorMessage(error)
    const errorType = detectErrorType(error)

    setError(errorMessage)

    // Log to console for debugging
    console.error('[LLM Error]', {
      type: errorType,
      message: errorMessage,
      original: error,
    })

    return new LLMError(errorType, errorMessage)
  }
}
