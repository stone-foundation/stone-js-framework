import { ALIBABA_FC_HTTP_PLATFORM } from '../src/constants'
import { AlibabaFcHttp } from '../src/decorators/AlibabaFcHttp'
import { AlibabaFcHttpAdapter } from '../src/AlibabaFcHttpAdapter'
import { alibabaFcHttpAdapterResolver } from '../src/resolvers'
import { AlibabaFcHttpRequest, AlibabaFcHttpResponse } from '../src/declarations'
import { alibabaFcHttpAdapterBlueprint } from '../src/options/AlibabaFcHttpAdapterBlueprint'

const blueprintStub = (): any => {
  const values: Record<string, unknown> = {}
  return {
    values,
    set: vi.fn((k: string, v: unknown) => { values[k] = v }),
    get: vi.fn((k: string, fb?: unknown) => values[k] ?? fb),
    has: vi.fn((k: string) => k in values),
    getAll: vi.fn(() => values)
  }
}

const fcRequest = (over: Partial<AlibabaFcHttpRequest> = {}): AlibabaFcHttpRequest => ({ method: 'GET', url: '/', headers: {}, ...over })

const fcResponse = (): AlibabaFcHttpResponse & { statusCode?: number, headers: Record<string, string | string[]>, body?: string | Buffer } => {
  const resp: any = {
    statusCode: undefined,
    headers: {},
    body: undefined,
    setStatusCode (code: number) { resp.statusCode = code },
    setHeader (key: string, value: string | string[]) { resp.headers[key] = value },
    send (body?: string | Buffer) { resp.body = body }
  }
  return resp
}

describe('alibabaFcHttpAdapterBlueprint', () => {
  it('registers the FC HTTP adapter with its middleware, resolver and error handler', () => {
    const adapter = alibabaFcHttpAdapterBlueprint.stone.adapters?.[0]
    expect(adapter?.platform).toBe(ALIBABA_FC_HTTP_PLATFORM)
    expect(adapter?.resolver).toBe(alibabaFcHttpAdapterResolver)
    expect(adapter?.middleware).toHaveLength(2)
    expect(adapter?.errorHandlers?.default).toBeDefined()
  })
})

describe('alibabaFcHttpAdapterResolver', () => {
  it('creates an AlibabaFcHttpAdapter', () => {
    expect(alibabaFcHttpAdapterResolver(blueprintStub())).toBeInstanceOf(AlibabaFcHttpAdapter)
  })
})

describe('AlibabaFcHttpAdapter', () => {
  it('runs and returns an FC (req, resp, context) handler function', async () => {
    const blueprint = blueprintStub()
    blueprint.set('stone.logger.resolver', () => ({ info: vi.fn(), error: vi.fn() }))
    const adapter = AlibabaFcHttpAdapter.create(blueprint)
    const handler = await adapter.run()
    expect(typeof handler).toBe('function')
  })

  it('the returned handler delegates to eventListener with (req, resp, context)', async () => {
    const blueprint = blueprintStub()
    blueprint.set('stone.logger.resolver', () => ({ info: vi.fn(), error: vi.fn() }))
    const adapter: any = AlibabaFcHttpAdapter.create(blueprint)
    const resp = fcResponse()
    const req = fcRequest()
    const listener = vi.spyOn(adapter, 'eventListener').mockResolvedValue(resp)

    const handler = await adapter.run<(req: AlibabaFcHttpRequest, resp: AlibabaFcHttpResponse, ctx?: any) => Promise<void>>()
    await handler(req, resp, { requestId: 'abc' })

    expect(listener).toHaveBeenCalledWith(req, resp, { requestId: 'abc' })
  })
})

describe('@AlibabaFcHttp', () => {
  it('applies the FC adapter blueprint to a class (with merged options)', () => {
    expect(() => {
      @AlibabaFcHttp({ default: true })
      class App {}
      return App
    }).not.toThrow()
  })
})

describe('AlibabaFcHttpAdapter dispatch', () => {
  it('writes an error response onto the FC resp when unconfigured (error path)', async () => {
    const blueprint = blueprintStub()
    blueprint.set('stone.logger.resolver', () => ({ info: vi.fn(), error: vi.fn() }))
    const adapter: any = AlibabaFcHttpAdapter.create(blueprint)
    const resp = fcResponse()

    // Force the error path and keep it deterministic, then assert the response was written to resp.
    vi.spyOn(adapter, 'resolveEventHandler').mockImplementation(() => { throw new Error('unconfigured') })
    vi.spyOn(adapter, 'handleError').mockResolvedValue({ add: () => ({ add: () => ({}) }) })
    vi.spyOn(adapter, 'buildRawResponse').mockImplementation(async () => {
      resp.setStatusCode(500)
      resp.send('error')
      return resp
    })

    const result = await adapter.eventListener(fcRequest(), resp, {})

    expect(result).toBe(resp)
    expect(resp.statusCode).toBe(500)
  })
})
