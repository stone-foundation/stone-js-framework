import { RouterError } from '../src/errors/RouterError'
import { RouterErrorHandler } from '../src/RouterErrorHandler'
import { MethodNotAllowedError } from '../src/errors/MethodNotAllowedError'

describe('RouterErrorHandler', () => {
  const createLogger = (): any => ({
    error: vi.fn()
  })

  const createEvent = (type = 'html'): any => ({
    preferredType: vi.fn(() => type)
  })

  it('should throw if logger is not provided', () => {
    expect(() => new RouterErrorHandler({ logger: undefined as any })).toThrow(RouterError)
  })

  it('should handle RouteNotFoundError and return 404 (HTML)', () => {
    const logger = createLogger()
    const event = createEvent('html')
    const handler = new RouterErrorHandler({ logger })

    const error = new Error('Missing')
    error.name = 'RouteNotFoundError'

    const result = handler.handle(error, event)

    expect(result).toEqual({ statusCode: 404, content: 'Not Found' })
    expect(logger.error).toHaveBeenCalledWith('Missing', { error })
  })

  it('should handle MethodNotAllowedError and return 405 (JSON)', () => {
    const logger = createLogger()
    const event = createEvent('json')
    const handler = new RouterErrorHandler({ logger })

    const error = new Error('Wrong method')
    error.name = 'MethodNotAllowedError'

    const result = handler.handle(error, event)

    expect(result).toEqual({ statusCode: 405, content: { error: 'Method Not Allowed' } })
    expect(logger.error).toHaveBeenCalledWith('Wrong method', { error })
  })

  it('should emit an Allow header on 405 when the error carries allowed methods', () => {
    const logger = createLogger()
    const event = createEvent('html')
    const handler = new RouterErrorHandler({ logger })

    const error = new MethodNotAllowedError('Wrong method', { metadata: { allowedMethods: ['GET', 'POST'] } })

    const result: any = handler.handle(error, event)

    expect(result.statusCode).toBe(405)
    expect(result.headers).toEqual({ Allow: 'GET, POST' })
  })

  it('should fallback to 500 for unknown error types', () => {
    const logger = createLogger()
    const event = createEvent('html')
    const handler = new RouterErrorHandler({ logger })

    const error = new Error('Something bad happened')

    const result = handler.handle(error, event)

    expect(result).toEqual({ statusCode: 500, content: 'Internal Server Error' })
    expect(logger.error).toHaveBeenCalledWith('Something bad happened', { error })
  })

  it('should return JSON object if preferredType is json', async () => {
    const logger = createLogger()
    const event = createEvent('json')
    const handler = new RouterErrorHandler({ logger })

    const error = new Error('Unknown')
    error.name = 'Unknown'

    const result = await handler.handle(error, event)
    expect(result.content).toEqual({ error: 'Internal Server Error' })
  })

  it('should return string if preferredType is text/html/xml', async () => {
    const logger = createLogger()
    const handler = new RouterErrorHandler({ logger })

    const error = new Error('Boom')

    const htmlEvent = createEvent('html')
    const textEvent = createEvent('text')
    const xmlEvent = createEvent('xml')

    expect((await handler.handle(error, htmlEvent)).content).toBe('Internal Server Error')
    expect((await handler.handle(error, textEvent)).content).toBe('Internal Server Error')
    expect((await handler.handle(error, xmlEvent)).content).toBe('Internal Server Error')
  })
})
