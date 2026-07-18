import { ErrorOptions } from '../../src/declarations'
import { RuntimeError } from '../../src/errors/RuntimeError'

/**
 * Unit tests for the RuntimeError class.
 */
describe('RuntimeError', () => {
  it('should create an instance of RuntimeError with a message', () => {
    const error = new RuntimeError('Something went wrong')
    expect(error).toBeInstanceOf(RuntimeError)
    expect(error.message).toBe('Something went wrong')
    expect(error.name).toBe('RuntimeError')
  })

  it('should set the error code when provided', () => {
    const options: ErrorOptions = { code: 'ERR001' }
    const error = RuntimeError.create('Error with code', options)
    expect(error.code).toBe('ERR001')
  })

  it('should set the metadata when provided', () => {
    const metadata = { detail: 'Extra error information' }
    const options: ErrorOptions = { metadata }
    const error = new RuntimeError('Error with metadata', options)
    expect(error.metadata).toEqual(metadata)
  })

  it('should set the cause when provided', () => {
    const cause = new Error('Original cause')
    const options: ErrorOptions = { cause }
    const error = new RuntimeError('Error with cause', options)
    expect(error.cause).toBe(cause)
  })

  it('should capture the stack trace', () => {
    const error = new RuntimeError('Stack trace test')
    expect(error.stack).toBeDefined()
  })

  it('should return a single-line string representation', () => {
    const error = new RuntimeError('Single-line error', { code: 'ERR002', metadata: { key: 'value' } })
    const result = error.toString()
    expect(result).toBe('[RuntimeError], Code: ERR002, Message: "Single-line error", Metadata: {"key":"value"}')
  })

  it('should return a multi-line string representation', () => {
    const error = new RuntimeError('Multi-line error', { code: 'ERR003', metadata: { key: 'value' } })
    const result = error.toString(true)
    expect(result).toBe(
      'Error: RuntimeError\nCode: ERR003\nMessage: "Multi-line error"\nMetadata: {"key":"value"}'
    )
  })

  it('should handle error without code or metadata', () => {
    const error = new RuntimeError('Simple error')
    const result = error.toString()
    expect(result).toBe('[RuntimeError], Message: "Simple error"')
  })

  it('should handle multi-line output without code or metadata', () => {
    const error = new RuntimeError('Another simple error')
    const result = error.toString(true)
    expect(result).toBe('Error: RuntimeError\nMessage: "Another simple error"')
  })

  it('should use fallback stack trace mechanism when Error.captureStackTrace is undefined', () => {
    // Backup original captureStackTrace
    const originalCaptureStackTrace = Error.captureStackTrace;

    // Mock Error.captureStackTrace to be undefined
    (Error as any).captureStackTrace = undefined

    // Create a RuntimeError instance
    const error = new RuntimeError('Fallback stack trace test')

    // Validate that the error has a stack
    expect(error.stack).toBeDefined()

    // Restore original captureStackTrace
    Error.captureStackTrace = originalCaptureStackTrace
  })
})
