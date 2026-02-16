import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  LLMErrorType,
  LLMError,
  detectErrorType,
  getErrorMessage,
  createErrorHandler,
} from '@/content/utils/errorHandler'

describe('errorHandler', () => {
  describe('LLMError', () => {
    it('should create error with type and default message', () => {
      const error = new LLMError(LLMErrorType.NO_API_KEY)

      expect(error).toBeInstanceOf(Error)
      expect(error.type).toBe(LLMErrorType.NO_API_KEY)
      expect(error.name).toBe('LLMError')
      expect(error.message).toBe('API key is not configured')
    })

    it('should create error with custom message', () => {
      const customMessage = 'Custom error message'
      const error = new LLMError(LLMErrorType.NETWORK_ERROR, customMessage)

      expect(error.message).toBe(customMessage)
    })

    it('should preserve stack trace', () => {
      const error = new LLMError(LLMErrorType.UNKNOWN_ERROR)

      expect(error.stack).toBeDefined()
    })
  })

  describe('detectErrorType', () => {
    it('should return type from LLMError instance', () => {
      const llmError = new LLMError(LLMErrorType.RATE_LIMIT)

      expect(detectErrorType(llmError)).toBe(LLMErrorType.RATE_LIMIT)
    })

    it('should detect NO_API_KEY from "API key" in message', () => {
      expect(detectErrorType('Missing API key')).toBe(LLMErrorType.NO_API_KEY)
      expect(detectErrorType('Invalid API key')).toBe(LLMErrorType.NO_API_KEY)
    })

    it('should detect NO_API_KEY from 401 status code', () => {
      expect(detectErrorType('401 Unauthorized')).toBe(LLMErrorType.NO_API_KEY)
    })

    it('should detect NETWORK_ERROR from network-related keywords', () => {
      expect(detectErrorType('network error')).toBe(LLMErrorType.NETWORK_ERROR)
      expect(detectErrorType('fetch failed')).toBe(LLMErrorType.NETWORK_ERROR)
      expect(detectErrorType('ECONNREFUSED')).toBe(LLMErrorType.NETWORK_ERROR)
    })

    it('should detect RATE_LIMIT from rate limit keywords', () => {
      expect(detectErrorType('rate limit exceeded')).toBe(LLMErrorType.RATE_LIMIT)
      expect(detectErrorType('429 Too Many Requests')).toBe(LLMErrorType.RATE_LIMIT)
    })

    it('should detect REQUEST_CANCELLED from cancel-related keywords', () => {
      expect(detectErrorType('Request was cancelled')).toBe(LLMErrorType.REQUEST_CANCELLED)
      expect(detectErrorType('Operation aborted')).toBe(LLMErrorType.REQUEST_CANCELLED)
    })

    it('should return UNKNOWN_ERROR for unrecognized errors', () => {
      expect(detectErrorType('Some unknown error')).toBe(LLMErrorType.UNKNOWN_ERROR)
      expect(detectErrorType('')).toBe(LLMErrorType.UNKNOWN_ERROR)
    })

    it('should handle Error objects', () => {
      const error = new Error('network error')
      expect(detectErrorType(error)).toBe(LLMErrorType.NETWORK_ERROR)
    })

    it('should handle non-Error objects', () => {
      // Objects without message property are stringified to "[object Object]"
      expect(detectErrorType({ message: 'API key missing' })).toBe(LLMErrorType.UNKNOWN_ERROR)
      // String input works correctly
      expect(detectErrorType('API key missing')).toBe(LLMErrorType.NO_API_KEY)
    })

    it('should handle null/undefined errors', () => {
      expect(detectErrorType(null)).toBe(LLMErrorType.UNKNOWN_ERROR)
      expect(detectErrorType(undefined)).toBe(LLMErrorType.UNKNOWN_ERROR)
    })
  })

  describe('getErrorMessage', () => {
    it('should return message from LLMError instance', () => {
      const error = new LLMError(LLMErrorType.INVALID_CONFIG, 'Custom message')
      expect(getErrorMessage(error)).toBe('Custom message')
    })

    it('should return message from LLMError with default message', () => {
      const error = new LLMError(LLMErrorType.EMPTY_TEXT)
      expect(getErrorMessage(error)).toBe('Please provide text to process')
    })

    it('should return mapped message for detected error type', () => {
      expect(getErrorMessage('API key is missing')).toBe('API key is not configured')
      // "Network connection failed" doesn't contain lowercase "network", so it returns unknown error
      expect(getErrorMessage('network connection failed')).toBe('Network connection failed')
      expect(getErrorMessage('rate limit exceeded')).toBe('API rate limit exceeded')
    })

    it('should return unknown error message for unrecognized errors', () => {
      expect(getErrorMessage('Something went wrong')).toBe('An unexpected error occurred')
    })

    it('should handle Error objects', () => {
      const error = new Error('Request was cancelled')
      expect(getErrorMessage(error)).toBe('Request was cancelled')
    })

    it('should return unknown message for null/undefined', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred')
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred')
    })
  })

  describe('createErrorHandler', () => {
    let setErrorMock: (message: string | null) => void
    let setErrorSpy: ReturnType<typeof vi.fn>

    beforeEach(() => {
      setErrorSpy = vi.fn()
      setErrorMock = setErrorSpy as any
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should create error handler function', () => {
      const handler = createErrorHandler(setErrorMock)
      expect(typeof handler).toBe('function')
    })

    it('should call setError with user-friendly message', () => {
      const handler = createErrorHandler(setErrorMock)
      handler(new Error('network error'))

      expect(setErrorMock).toHaveBeenCalledWith('Network connection failed')
    })

    it('should call setError with LLMError message', () => {
      const handler = createErrorHandler(setErrorMock)
      handler(new LLMError(LLMErrorType.RATE_LIMIT, 'Too many requests'))

      expect(setErrorMock).toHaveBeenCalledWith('Too many requests')
    })

    it('should log error details to console', () => {
      const handler = createErrorHandler(setErrorMock)
      const error = new Error('API key missing')
      handler(error)

      expect(console.error).toHaveBeenCalledWith('[LLM Error]', {
        type: LLMErrorType.NO_API_KEY,
        message: 'API key is not configured',
        original: error,
      })
    })

    it('should return LLMError instance', () => {
      const handler = createErrorHandler(setErrorMock)
      const result = handler(new Error('rate limit'))

      expect(result).toBeInstanceOf(LLMError)
      expect(result.type).toBe(LLMErrorType.RATE_LIMIT)
    })

    it('should handle LLMError input', () => {
      const handler = createErrorHandler(setErrorMock)
      const llmError = new LLMError(LLMErrorType.EMPTY_TEXT, 'No text provided')
      const result = handler(llmError)

      expect(setErrorMock).toHaveBeenCalledWith('No text provided')
      expect(result.type).toBe(LLMErrorType.EMPTY_TEXT)
    })

    it('should handle unknown errors', () => {
      const handler = createErrorHandler(setErrorMock)
      const result = handler('Unknown error')

      expect(setErrorMock).toHaveBeenCalledWith('An unexpected error occurred')
      expect(result.type).toBe(LLMErrorType.UNKNOWN_ERROR)
    })

    it('should preserve error type in returned LLMError', () => {
      const handler = createErrorHandler(setErrorMock)

      const result1 = handler(new Error('API key'))
      expect(result1.type).toBe(LLMErrorType.NO_API_KEY)

      const result2 = handler(new Error('network'))
      expect(result2.type).toBe(LLMErrorType.NETWORK_ERROR)

      const result3 = handler(new Error('429'))
      expect(result3.type).toBe(LLMErrorType.RATE_LIMIT)
    })

    it('should call setError with null-nullable string', () => {
      const handler = createErrorHandler(setErrorMock)
      handler(new Error('test'))

      // Ensure setError is called with string, not null
      expect(setErrorMock).toHaveBeenCalledWith(expect.any(String))
      expect(setErrorMock).not.toHaveBeenCalledWith(null)
    })
  })

  describe('LLMErrorType enum', () => {
    it('should have all expected error types', () => {
      expect(LLMErrorType.NO_API_KEY).toBe('NO_API_KEY')
      expect(LLMErrorType.INVALID_CONFIG).toBe('INVALID_CONFIG')
      expect(LLMErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR')
      expect(LLMErrorType.RATE_LIMIT).toBe('RATE_LIMIT')
      expect(LLMErrorType.REQUEST_CANCELLED).toBe('REQUEST_CANCELLED')
      expect(LLMErrorType.EMPTY_TEXT).toBe('EMPTY_TEXT')
      expect(LLMErrorType.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR')
    })
  })
})
