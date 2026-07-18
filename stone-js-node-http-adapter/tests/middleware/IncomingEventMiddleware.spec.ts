import proxyAddr from 'proxy-addr'
import { NextMiddleware } from '@stone-js/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NodeHttpAdapterError } from '../../src/errors/NodeHttpAdapterError'
import { IncomingEventMiddleware } from '../../src/middleware/IncomingEventMiddleware'
import { NodeHttpAdapterContext, NodeHttpAdapterResponseBuilder } from '../../src/declarations'
import {
  getProtocol,
  CookieCollection,
  getHostname,
  isIpTrusted
} from '@stone-js/http-core'

vi.mock('proxy-addr')

vi.mock('@stone-js/http-core', () => ({
  getProtocol: vi.fn(),
  getHostname: vi.fn(),
  isIpTrusted: vi.fn(),
  CookieCollection: {
    create: vi.fn()
  }
}))

describe('IncomingEventMiddleware', () => {
  let mockBlueprint: any
  let middleware: IncomingEventMiddleware
  let mockContext: NodeHttpAdapterContext
  let next: NextMiddleware<NodeHttpAdapterContext, NodeHttpAdapterResponseBuilder>

  beforeEach(() => {
    mockBlueprint = {
      get: vi.fn((key: string, defaultValue: any) => defaultValue)
    }

    middleware = new IncomingEventMiddleware({ blueprint: mockBlueprint })

    mockContext = {
      rawEvent: {
        method: 'GET',
        url: '/test',
        headers: { cookie: 'testCookie' },
        socket: {
          remoteAddress: '127.0.0.1'
        }
      },
      rawResponse: {},
      incomingEventBuilder: {
        add: vi.fn().mockReturnThis(),
        addIf: vi.fn().mockReturnThis()
      }
    } as unknown as NodeHttpAdapterContext

    next = vi.fn()

    vi.mocked(proxyAddr).mockRestore()
    vi.mocked(proxyAddr.all).mockRestore()
  })

  it('should throw error if context is missing rawEvent or incomingEventBuilder', async () => {
    // @ts-expect-error
    mockContext.rawEvent = null

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(NodeHttpAdapterError)

    // @ts-expect-error
    mockContext.rawEvent = { foo: 'bar' } as any
    // @ts-expect-error
    mockContext.incomingEventBuilder = null

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(NodeHttpAdapterError)
  })

  it('should call next with the modified context', async () => {
    vi.mocked(getHostname).mockReturnValue('localhost')
    vi.mocked(getProtocol).mockReturnValue('http')
    vi.mocked(proxyAddr).mockReturnValue('127.0.0.1')
    vi.mocked(proxyAddr.all).mockReturnValue(['127.0.0.1'])
    vi.mocked(isIpTrusted).mockReturnValue(vi.fn().mockReturnValue(true))
    vi.mocked(CookieCollection.create).mockReturnValue({ testCookie: 'value' } as any)

    await middleware.handle(mockContext, next)

    expect(next).toHaveBeenCalledWith(mockContext)
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('ips', [])
    expect(mockContext.incomingEventBuilder?.addIf).toHaveBeenCalledWith('method', 'GET')
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('url', expect.any(URL))
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('cookies', { testCookie: 'value' })
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('headers', mockContext.rawEvent?.headers)
  })

  it('should extract URL correctly', () => {
    vi.mocked(getProtocol).mockImplementation((a, b, c, d) => 'http')
    vi.mocked(getHostname).mockImplementation((a, b, c) => 'localhost')
    mockContext.rawEvent.url = undefined
    // @ts-expect-error
    mockContext.rawEvent.socket.remoteAddress = undefined
    // @ts-expect-error
    const url = middleware.extractUrl(mockContext.rawEvent, {
      trusted: [],
      trustedIp: [],
      untrustedIp: []
    })

    expect(url).toBeInstanceOf(URL)
    expect(url.toString()).toBe('http://localhost/')
  })

  it('should extract protocol correctly', () => {
    vi.mocked(getProtocol).mockImplementation((a, b, c, d) => 'http')
    // @ts-expect-error
    mockContext.rawEvent.socket.remoteAddress = undefined
    // @ts-expect-error
    const proto = middleware.getProtocol(mockContext.rawEvent, {
      trusted: [],
      trustedIp: [],
      untrustedIp: []
    })

    expect(proto).toBe('http')
  })

  it('should extract IP addresses correctly', () => {
    vi.mocked(proxyAddr.all).mockReturnValue(['127.0.0.1', '192.168.1.1'])
    vi.mocked(isIpTrusted).mockReturnValue(() => true)

    // @ts-expect-error
    const ips = middleware.extractIpAddresses(mockContext.rawEvent, {
      trusted: [],
      trustedIp: [],
      untrustedIp: []
    })

    expect(ips).toEqual(['192.168.1.1'])
    expect(proxyAddr.all).toHaveBeenCalled()
  })

  it('should retrieve proxy options from blueprint', () => {
    // @ts-expect-error
    const proxyOptions = middleware.getProxyOptions()

    expect(proxyOptions).toEqual({ trusted: [], trustedIp: [], untrustedIp: [] })
    expect(mockBlueprint.get).toHaveBeenCalledWith('stone.http.proxies', {
      trusted: [],
      trustedIp: [],
      untrustedIp: []
    })
  })

  it('should retrieve cookie options from blueprint', () => {
    // @ts-expect-error
    const cookieOptions = middleware.getCookieOptions()

    expect(cookieOptions).toEqual({})
    expect(mockBlueprint.get).toHaveBeenCalledWith('stone.http.cookie.options', {})
  })

  it('should retrieve cookie secret from blueprint', () => {
    mockBlueprint.get.mockImplementation((key: string) => {
      if (key === 'stone.http.cookie.secret') return 'secret'
      return 'defaultSecret'
    })

    // @ts-expect-error
    const secret = middleware.getCookieSecret()

    expect(secret).toBe('secret')
    expect(mockBlueprint.get).toHaveBeenCalledWith('stone.http.cookie.secret', 'defaultSecret')
  })
})
