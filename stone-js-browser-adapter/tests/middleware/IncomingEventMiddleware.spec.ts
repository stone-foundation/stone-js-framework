import { NextMiddleware } from '@stone-js/core'
import { BROWSER_PLATFORM } from '../../src/constants'
import { CookieCollection } from '@stone-js/browser-core'
import { BrowserAdapterError } from '../../src/errors/BrowserAdapterError'
import { IncomingEventMiddleware } from '../../src/middleware/IncomingEventMiddleware'
import { BrowserAdapterContext, BrowserAdapterResponseBuilder } from '../../src/declarations'

vi.mock('@stone-js/browser-core', () => ({
  CookieCollection: {
    create: vi.fn()
  }
}))

describe('IncomingEventMiddleware', () => {
  let mockBlueprint: any
  let middleware: IncomingEventMiddleware
  let mockContext: BrowserAdapterContext
  let next: NextMiddleware<BrowserAdapterContext, BrowserAdapterResponseBuilder>

  beforeEach(() => {
    mockBlueprint = {
      get: vi.fn((key: string, defaultValue: any) => defaultValue)
    }

    middleware = new IncomingEventMiddleware({ blueprint: mockBlueprint })

    mockContext = {
      rawEvent: {
        state: {}
      },
      rawResponse: {},
      incomingEventBuilder: {
        add: vi.fn().mockReturnThis()
      },
      executionContext: {
        document: {
          cookie: 'testCookie=value'
        },
        location: new URL('http://localhost/?name=John')
      }
    } as unknown as BrowserAdapterContext

    next = vi.fn()
  })

  it('should throw error if context is missing rawEvent', async () => {
    // @ts-expect-error
    mockContext.rawEvent = undefined
    await expect(middleware.handle(mockContext, next)).rejects.toThrow(BrowserAdapterError)
  })

  it('should throw error if context is missing incomingEventBuilder', async () => {
    // @ts-expect-error
    mockContext.incomingEventBuilder = undefined
    await expect(middleware.handle(mockContext, next)).rejects.toThrow(BrowserAdapterError)
  })

  it('should throw error if context is missing executionContext', async () => {
    // @ts-expect-error
    mockContext.executionContext = undefined
    await expect(middleware.handle(mockContext, next)).rejects.toThrow(BrowserAdapterError)
  })

  it('should call next with the modified context', async () => {
    vi.mocked(CookieCollection.create).mockReturnValue({ testCookie: 'value' } as any)

    await middleware.handle(mockContext, next)

    expect(next).toHaveBeenCalledWith(mockContext)
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('protocol', 'http')
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('url', expect.any(URL))
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('metadata', expect.any(Object))
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('cookies', { testCookie: 'value' })
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('queryString', mockContext.executionContext.location.search)
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('source', expect.objectContaining({ platform: BROWSER_PLATFORM }))
  })

  it('should retrieve cookie options from blueprint', () => {
    // @ts-expect-error
    const cookieOptions = middleware.getCookieOptions()

    expect(cookieOptions).toEqual({})
    expect(mockBlueprint.get).toHaveBeenCalledWith('stone.browser.cookie.options', {})
  })
})
