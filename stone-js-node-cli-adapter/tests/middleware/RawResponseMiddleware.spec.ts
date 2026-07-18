import { Mock } from 'vitest'
import { NodeCliAdapterContext } from '../../src/declarations'
import { NodeCliAdapterError } from '../../src/errors/NodeCliAdapterError'
import { RawResponseMiddleware } from '../../src/middleware/RawResponseMiddleware'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('statuses')

describe('RawResponseMiddleware', () => {
  let next: Mock
  let middleware: RawResponseMiddleware
  let mockContext: NodeCliAdapterContext

  beforeEach(() => {
    middleware = new RawResponseMiddleware()

    mockContext = {
      rawEvent: {},
      rawResponse: {},
      rawResponseBuilder: {
        add: vi.fn().mockReturnThis()
      },
      incomingEvent: {
        isMethod: vi.fn()
      },
      outgoingResponse: {
        exitCode: 0,
        statusCode: 0
      }
    } as unknown as NodeCliAdapterContext

    next = vi.fn(() => mockContext.rawResponseBuilder)
  })

  it('should throw an error if context is missing required components', async () => {
    mockContext.outgoingResponse = undefined

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(NodeCliAdapterError)

    // @ts-expect-error
    mockContext.outgoingResponse = {}
    // @ts-expect-error
    mockContext.rawResponseBuilder = null

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(NodeCliAdapterError)
  })

  it('should add exitCode and status code to the response builder', async () => {
    await middleware.handle(mockContext, next)

    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('exitCode', 0)
    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('statusCode', 0)
  })

  it('should add default exitCode and status code to the response builder when not provided in response', async () => {
    // @ts-expect-error - Ignore for testing purposes
    mockContext.outgoingResponse = {}
    await middleware.handle(mockContext, next)

    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('exitCode', 404)
    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('statusCode', 404)
  })
})
