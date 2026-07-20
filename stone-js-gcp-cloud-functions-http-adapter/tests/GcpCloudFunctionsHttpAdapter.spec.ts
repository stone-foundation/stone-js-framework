import { AdapterEventBuilder } from '@stone-js/core'
import { IncomingHttpEvent } from '@stone-js/http-core'
import { GcpCloudFunctionsHttpAdapter } from '../src/GcpCloudFunctionsHttpAdapter'
import { ServerResponseWrapper } from '../src/ServerResponseWrapper'
import { IncomingMessage, ServerResponse } from 'node:http'

vi.mock('chalk', () => ({
  default: {
    red: (msg: string) => msg,
    green: (msg: string) => msg,
    white: (msg: string) => msg,
    gray: (msg: string) => msg,
    blue: (msg: string) => msg
  }
}))

describe('GcpCloudFunctionsHttpAdapter', () => {
  let blueprint: any

  beforeEach(() => {
    blueprint = {
      values: {},
      set: vi.fn((key, value) => {
        blueprint.values[key] = value
      }),
      get: vi.fn((key, fallback) => blueprint.values[key] ?? fallback),
      has: vi.fn((key) => key in blueprint.values),
      getAll: vi.fn(() => blueprint.values)
    }
    blueprint.set('stone.logger.resolver', () => ({
      info: vi.fn(),
      error: vi.fn()
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete (globalThis as any).window
  })

  it('should create an instance', () => {
    const adapter = GcpCloudFunctionsHttpAdapter.create(blueprint)
    expect(adapter).toBeInstanceOf(GcpCloudFunctionsHttpAdapter)
  })

  it('run() returns a (req, res) handler, not a server, and fires onStart hooks', async () => {
    const adapter = GcpCloudFunctionsHttpAdapter.create(blueprint)
    const executeHooks = vi.spyOn<any, any>(adapter, 'executeHooks').mockResolvedValue(undefined)

    const handler = await adapter.run<(req: any, res: any) => Promise<ServerResponse>>()

    expect(typeof handler).toBe('function')
    expect(executeHooks).toHaveBeenCalledWith('onStart')
  })

  it('the handler returned by run() delegates to eventListener', async () => {
    const adapter = GcpCloudFunctionsHttpAdapter.create(blueprint)
    vi.spyOn<any, any>(adapter, 'executeHooks').mockResolvedValue(undefined)
    const req = new IncomingMessage(null as any)
    const res = new ServerResponse(req)
    const listener = vi.spyOn<any, any>(adapter, 'eventListener').mockResolvedValue(res)

    const handler = await adapter.run<(req: any, res: any) => Promise<ServerResponse>>()
    const result = await handler(req, res)

    expect(listener).toHaveBeenCalledWith(req, res)
    expect(result).toBe(res)
  })

  it('onStart throws when used in a browser context', async () => {
    const adapter = GcpCloudFunctionsHttpAdapter.create(blueprint)
    Object.defineProperty(globalThis, 'window', { value: {}, configurable: true })
    // @ts-expect-error - private access
    await expect(adapter.onStart()).rejects.toThrow('must be used only in a Node.js')
  })

  it('should handle an incoming event and send a response', async () => {
    const adapter = GcpCloudFunctionsHttpAdapter.create(blueprint)
    const req = new IncomingMessage(null as any)
    const res = new ServerResponse(req)

    IncomingHttpEvent.create = vi.fn()
    ServerResponseWrapper.create = vi.fn()
    AdapterEventBuilder.create = vi.fn(({ resolver }) => resolver({}))

    vi.spyOn<any, any>(adapter, 'resolveEventHandler').mockReturnValue({ handle: vi.fn() })
    vi.spyOn<any, any>(adapter, 'sendEventThroughDestination').mockResolvedValue(res)
    vi.spyOn<any, any>(adapter, 'executeEventHandlerHooks').mockResolvedValue(undefined)

    // @ts-expect-error - private access
    const result = await adapter.eventListener(req, res)

    expect(result).toBeInstanceOf(ServerResponse)
    expect(IncomingHttpEvent.create).toHaveBeenCalled()
    expect(AdapterEventBuilder.create).toHaveBeenCalled()
    expect(ServerResponseWrapper.create).toHaveBeenCalled()
  })

  it('should handle errors in eventListener and build a raw response', async () => {
    const adapter = GcpCloudFunctionsHttpAdapter.create(blueprint)
    const req = new IncomingMessage(null as any)
    const res = new ServerResponse(req)

    vi.spyOn<any, any>(adapter, 'resolveEventHandler').mockImplementation(() => { throw new Error('test') })
    vi.spyOn<any, any>(adapter, 'handleError').mockResolvedValue({ respond: vi.fn().mockResolvedValue(res) })
    vi.spyOn<any, any>(adapter, 'buildRawResponse').mockResolvedValue(res)

    // @ts-expect-error - private access
    const result = await adapter.eventListener(req, res)

    req.emit('error', new Error('test'))
    res.emit('error', new Error('test'))

    expect(result).toBeInstanceOf(ServerResponse)
    // @ts-expect-error - private access
    expect(adapter.logger.error).toHaveBeenCalledTimes(2)
  })

  it('sets a 400 status when the incoming request stream errors', async () => {
    const adapter = GcpCloudFunctionsHttpAdapter.create(blueprint)
    const req = new IncomingMessage(null as any)
    const res = new ServerResponse(req)

    vi.spyOn<any, any>(adapter, 'resolveEventHandler').mockReturnValue({ handle: vi.fn() })
    vi.spyOn<any, any>(adapter, 'sendEventThroughDestination').mockResolvedValue(res)
    vi.spyOn<any, any>(adapter, 'executeEventHandlerHooks').mockResolvedValue(undefined)

    // @ts-expect-error - private access
    await adapter.eventListener(req, res)
    req.emit('error', new Error('boom'))

    expect(res.statusCode).toBe(400)
  })
})
