import { AZURE_FUNCTIONS_HTTP_PLATFORM } from '../src/constants'
import { AzureFunctionsHttpErrorHandler } from '../src/AzureFunctionsHttpErrorHandler'
import { AzureFunctionsHttpAdapterError } from '../src/errors/AzureFunctionsHttpAdapterError'
import { IncomingEventMiddleware } from '../src/middleware/IncomingEventMiddleware'
import { SetAzureFunctionsHttpResponseResolverMiddleware } from '../src/middleware/BlueprintMiddleware'

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

describe('IncomingEventMiddleware', () => {
  const build = async (request: Request): Promise<any> => {
    const incomingEventBuilder = builderStub()
    const context: any = { rawEvent: request, executionContext: { env: 'test' }, incomingEventBuilder }
    const mw = new IncomingEventMiddleware({ blueprint: blueprintStub() })
    await mw.handle(context, (async () => builderStub()) as any)
    return incomingEventBuilder.data
  }

  it('builds the incoming event from a Web Request', async () => {
    const data = await build(new Request('https://api.test/users?p=1', { headers: { cookie: 'a=1' } }))
    expect(data.url.pathname).toBe('/users')
    expect(data.method).toBe('GET')
    expect(data.queryString).toBe('p=1')
    expect(data.protocol).toBe('https')
    expect(data.source.platform).toBe(AZURE_FUNCTIONS_HTTP_PLATFORM)
    expect(data.source.rawContext).toEqual({ env: 'test' })
  })

  it('parses a JSON body into an object', async () => {
    const data = await build(new Request('https://api.test/', { method: 'POST', body: '{"name":"Bob"}', headers: { 'content-type': 'application/json' } }))
    expect(data.body).toEqual({ name: 'Bob' })
    expect(data.metadata.rawBody).toBe('{"name":"Bob"}')
  })

  it('wraps a non-object JSON body under `value`', async () => {
    const data = await build(new Request('https://api.test/', { method: 'POST', body: '42', headers: { 'content-type': 'application/json' } }))
    expect(data.body).toEqual({ value: 42 })
  })

  it('parses a URL-encoded body', async () => {
    const data = await build(new Request('https://api.test/', { method: 'POST', body: 'a=1&b=2', headers: { 'content-type': 'application/x-www-form-urlencoded' } }))
    expect(data.body).toEqual({ a: '1', b: '2' })
  })

  it('tolerates a malformed JSON body (falls back to empty, keeps rawBody)', async () => {
    const data = await build(new Request('https://api.test/', { method: 'POST', body: '{bad', headers: { 'content-type': 'application/json' } }))
    expect(data.body).toEqual({})
    expect(data.metadata.rawBody).toBe('{bad')
  })

  it('leaves body empty when there is none', async () => {
    const data = await build(new Request('https://api.test/'))
    expect(data.body).toEqual({})
  })

  it('throws when the context is incomplete', async () => {
    const mw = new IncomingEventMiddleware({ blueprint: blueprintStub() })
    await expect(mw.handle({} as any, (async () => builderStub()) as any)).rejects.toThrow(AzureFunctionsHttpAdapterError)
  })
})

describe('SetAzureFunctionsHttpResponseResolverMiddleware', () => {
  it('installs the response resolver for the fetch platform', async () => {
    const blueprint = blueprintStub({ 'stone.adapter.platform': AZURE_FUNCTIONS_HTTP_PLATFORM })
    const next = vi.fn(async () => blueprint)
    await SetAzureFunctionsHttpResponseResolverMiddleware({ blueprint } as any, next as any)
    expect(blueprint.set).toHaveBeenCalledWith('stone.kernel.responseResolver', expect.any(Function))
  })

  it('does nothing for another platform', async () => {
    const blueprint = blueprintStub({ 'stone.adapter.platform': 'node_http' })
    await SetAzureFunctionsHttpResponseResolverMiddleware({ blueprint } as any, (async () => blueprint) as any)
    expect(blueprint.set).not.toHaveBeenCalled()
  })
})

describe('AzureFunctionsHttpErrorHandler', () => {
  const handler = (): AzureFunctionsHttpErrorHandler => new AzureFunctionsHttpErrorHandler({
    blueprint: blueprintStub({ 'stone.logger.resolver': () => ({ error: vi.fn() }) })
  } as any)

  it('returns a JSON error when the client accepts JSON', () => {
    const b = { data: {}, add (k: string, v: unknown) { (this as any).data[k] = v; return this } } as any
    const context: any = { rawEvent: new Request('http://x/', { headers: { accept: 'application/json' } }), rawResponseBuilder: b }
    handler().handle(Object.assign(new Error('boom'), { statusCode: 400 }), context)
    expect(b.data.status).toBe(400)
    expect(b.data.headers['content-type']).toBe('application/json')
    expect(JSON.parse(b.data.body).statusCode).toBe(400)
  })

  it('returns plain text and derives status from the cause, defaulting to 500', () => {
    const b = { data: {}, add (k: string, v: unknown) { (this as any).data[k] = v; return this } } as any
    const context: any = { rawEvent: new Request('http://x/'), rawResponseBuilder: b }
    handler().handle(new Error('plain'), context)
    expect(b.data.status).toBe(500)
    expect(b.data.headers['content-type']).toBe('text/plain')
  })
})
