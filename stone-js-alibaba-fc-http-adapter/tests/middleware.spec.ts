import { ALIBABA_FC_HTTP_PLATFORM } from '../src/constants'
import { AlibabaFcHttpRequest } from '../src/declarations'
import { AlibabaFcHttpErrorHandler } from '../src/AlibabaFcHttpErrorHandler'
import { AlibabaFcHttpAdapterError } from '../src/errors/AlibabaFcHttpAdapterError'
import { IncomingEventMiddleware } from '../src/middleware/IncomingEventMiddleware'
import { SetAlibabaFcHttpResponseResolverMiddleware } from '../src/middleware/BlueprintMiddleware'

const blueprintStub = (over: Record<string, unknown> = {}): any => ({
  get: (key: string, fallback?: unknown) => key in over ? over[key] : fallback,
  set: vi.fn()
})

const builderStub = (): any => {
  const bag: any = {
    data: {},
    add (k: string, v: unknown) { bag.data[k] = v; return bag },
    addIf (k: string, v: unknown) { if (bag.data[k] === undefined) { bag.data[k] = v } return bag }
  }
  return bag
}

const fcRequest = (over: Partial<AlibabaFcHttpRequest> = {}): AlibabaFcHttpRequest => ({
  method: 'GET',
  url: '/',
  headers: { host: 'api.test' },
  ...over
})

const jsonBody = (raw: string): Partial<AlibabaFcHttpRequest> => ({
  method: 'POST',
  body: Buffer.from(raw),
  headers: { host: 'api.test', 'content-type': 'application/json' }
})

describe('IncomingEventMiddleware', () => {
  const build = async (request: AlibabaFcHttpRequest): Promise<any> => {
    const incomingEventBuilder = builderStub()
    const context: any = { rawEvent: request, executionContext: { env: 'test' }, incomingEventBuilder }
    const mw = new IncomingEventMiddleware({ blueprint: blueprintStub() })
    await mw.handle(context, (async () => builderStub()) as any)
    return incomingEventBuilder.data
  }

  it('builds the incoming event from an FC request', async () => {
    const data = await build(fcRequest({ url: '/users?p=1', headers: { host: 'api.test', cookie: 'a=1' } }))
    expect(data.url.pathname).toBe('/users')
    expect(data.method).toBe('GET')
    expect(data.queryString).toBe('p=1')
    expect(data.protocol).toBe('https')
    expect(data.source.platform).toBe(ALIBABA_FC_HTTP_PLATFORM)
    expect(data.source.rawContext).toEqual({ env: 'test' })
  })

  it('parses a JSON body into an object', async () => {
    const data = await build(fcRequest(jsonBody('{"name":"Bob"}')))
    expect(data.body).toEqual({ name: 'Bob' })
    expect(data.metadata.rawBody).toBe('{"name":"Bob"}')
  })

  it('wraps a non-object JSON body under `value`', async () => {
    const data = await build(fcRequest(jsonBody('42')))
    expect(data.body).toEqual({ value: 42 })
  })

  it('parses a URL-encoded body', async () => {
    const data = await build(fcRequest({
      method: 'POST',
      body: Buffer.from('a=1&b=2'),
      headers: { host: 'api.test', 'content-type': 'application/x-www-form-urlencoded' }
    }))
    expect(data.body).toEqual({ a: '1', b: '2' })
  })

  it('tolerates a malformed JSON body (falls back to empty, keeps rawBody)', async () => {
    const data = await build(fcRequest(jsonBody('{bad')))
    expect(data.body).toEqual({})
    expect(data.metadata.rawBody).toBe('{bad')
  })

  it('leaves body empty when there is none', async () => {
    const data = await build(fcRequest())
    expect(data.body).toEqual({})
  })

  it('throws when the context is incomplete', async () => {
    const mw = new IncomingEventMiddleware({ blueprint: blueprintStub() })
    await expect(mw.handle({} as any, (async () => builderStub()) as any)).rejects.toThrow(AlibabaFcHttpAdapterError)
  })
})

describe('SetAlibabaFcHttpResponseResolverMiddleware', () => {
  it('installs the response resolver for the FC platform', async () => {
    const blueprint = blueprintStub({ 'stone.adapter.platform': ALIBABA_FC_HTTP_PLATFORM })
    const next = vi.fn(async () => blueprint)
    await SetAlibabaFcHttpResponseResolverMiddleware({ blueprint } as any, next as any)
    expect(blueprint.set).toHaveBeenCalledWith('stone.kernel.responseResolver', expect.any(Function))
  })

  it('does nothing for another platform', async () => {
    const blueprint = blueprintStub({ 'stone.adapter.platform': 'node_http' })
    await SetAlibabaFcHttpResponseResolverMiddleware({ blueprint } as any, (async () => blueprint) as any)
    expect(blueprint.set).not.toHaveBeenCalled()
  })
})

describe('AlibabaFcHttpErrorHandler', () => {
  const handler = (): AlibabaFcHttpErrorHandler => new AlibabaFcHttpErrorHandler({
    blueprint: blueprintStub({ 'stone.logger.resolver': () => ({ error: vi.fn() }) })
  } as any)

  it('returns a JSON error when the client accepts JSON', () => {
    const b = { data: {}, add (k: string, v: unknown) { (this as any).data[k] = v; return this } } as any
    const context: any = { rawEvent: fcRequest({ headers: { accept: 'application/json' } }), rawResponseBuilder: b }
    handler().handle(Object.assign(new Error('boom'), { statusCode: 400 }), context)
    expect(b.data.status).toBe(400)
    expect(b.data.headers['content-type']).toBe('application/json')
    expect(JSON.parse(b.data.body).statusCode).toBe(400)
  })

  it('returns plain text and derives status from the cause, defaulting to 500', () => {
    const b = { data: {}, add (k: string, v: unknown) { (this as any).data[k] = v; return this } } as any
    const context: any = { rawEvent: fcRequest(), rawResponseBuilder: b }
    handler().handle(new Error('plain'), context)
    expect(b.data.status).toBe(500)
    expect(b.data.headers['content-type']).toBe('text/plain')
  })
})
