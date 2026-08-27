import { Logger } from '@stone-js/core'
import { AZURE_FUNCTIONS_HTTP_PLATFORM } from '../src/constants'
import { AzureFunctionsHttp } from '../src/decorators/AzureFunctionsHttp'
import { AzureFunctionsHttpAdapter } from '../src/AzureFunctionsHttpAdapter'
import { azureFunctionsHttpAdapterResolver } from '../src/resolvers'
import { azureFunctionsHttpAdapterBlueprint } from '../src/options/AzureFunctionsHttpAdapterBlueprint'

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

describe('azureFunctionsHttpAdapterBlueprint', () => {
  it('registers the fetch adapter with its middleware, resolver and error handler', () => {
    const adapter = azureFunctionsHttpAdapterBlueprint.stone.adapters?.[0]
    expect(adapter?.platform).toBe(AZURE_FUNCTIONS_HTTP_PLATFORM)
    expect(adapter?.resolver).toBe(azureFunctionsHttpAdapterResolver)
    expect(adapter?.middleware).toHaveLength(2)
    expect(adapter?.errorHandlers?.default).toBeDefined()
  })
})

describe('azureFunctionsHttpAdapterResolver', () => {
  it('creates a AzureFunctionsHttpAdapter', () => {
    expect(azureFunctionsHttpAdapterResolver(blueprintStub())).toBeInstanceOf(AzureFunctionsHttpAdapter)
  })
})

describe('AzureFunctionsHttpAdapter', () => {
  it('runs and returns a AzureFunctionsHttp handler function', async () => {
    const blueprint = blueprintStub()
    blueprint.set('stone.logger.resolver', () => ({ info: vi.fn(), error: vi.fn() }))
    const adapter = AzureFunctionsHttpAdapter.create(blueprint)
    const handler = await adapter.run<(request: Request) => Promise<Response>>()
    expect(typeof handler).toBe('function')
  })
})

describe('@AzureFunctionsHttp', () => {
  it('applies the fetch adapter blueprint to a class (with merged options)', () => {
    expect(() => {
      @AzureFunctionsHttp({ default: true })
      class App {}
      return App
    }).not.toThrow()
  })
})

describe('AzureFunctionsHttpAdapter dispatch', () => {
  it('carries a request through its own middleware and answers a Response', async () => {
    // A real request in, a real response out, through the middleware the blueprint registers. The
    // package had no such test: every other one asserted a piece in isolation, so the path from the
    // platform handler to the answer was never executed once, and a mis-wired normalizer would pass.
    const blueprint = blueprintStub()
    let seen: any

    blueprint.set('stone.logger.resolver', () => ({ info: vi.fn(), error: vi.fn() }))
    // The middleware are resolved with the running logger, so it has to exist before the pipeline
    // does: `Logger.getInstance()` throws otherwise, and the adapter would report a logging failure
    // as a failed request.
    Logger.init(blueprint)
    blueprint.set('stone.adapter.middleware', azureFunctionsHttpAdapterBlueprint.stone.adapters?.[0].middleware)
    blueprint.set('stone.adapter.eventHandlerResolver', () => ({
      handle: (event: any) => {
        seen = event
        return {
          statusCode: 201,
          statusMessage: 'Created',
          headers: new Headers({ 'content-type': 'application/json' }),
          content: { ok: true }
        }
      }
    }))

    const adapter = AzureFunctionsHttpAdapter.create(blueprint)
    const handler = await adapter.run<(request: Request) => Promise<any>>()
    const response = await handler(new Request('https://api.test/users?page=2', {
      method: 'POST',
      body: '{"name":"stone"}',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '9.9.9.9' }
    }))

    // What the handler received: the request, normalized into an intention.
    expect(seen.method).toBe('POST')
    expect(seen.pathname).toBe('/users')
    expect(seen.ip).toBe('9.9.9.9')

    // And what the platform received back: Azure takes an `HttpResponseInit`, not a Web `Response`,
    // so the body is already serialized here rather than read back off a stream.
    expect(response.status).toBe(201)
    expect((response as any).headers.get('content-type')).toBe('application/json')
    expect((response as any).body).toBe('{"ok":true}')
  })

  it('answers rather than throwing when the application is not configured', async () => {
    // An adapter that throws out of the platform handler answers nothing at all: the runtime turns
    // that into its own opaque failure, and the caller learns less than a 500 would tell them. The
    // previous version of this test caught the rejection and accepted either outcome, and set
    // `stone.adapter.errorHandlers` while the kernel reads `stone.adapter.errorHandlers.default`, so
    // it proved neither half.
    const handled: unknown[] = []
    const blueprint = blueprintStub()

    blueprint.set('stone.logger.resolver', () => ({ info: vi.fn(), error: vi.fn() }))
    blueprint.set('stone.adapter.errorHandlers.default', {
      isClass: true,
      module: class {
        handle (error: unknown): any {
          handled.push(error)
          // What the kernel does with it: `build().respond()`.
          return { build: () => ({ respond: () => new Response(null, { status: 500 }) }) }
        }
      }
    })

    const adapter = AzureFunctionsHttpAdapter.create(blueprint)
    const handler = await adapter.run<(request: Request) => Promise<Response>>()
    const response = await handler(new Request('http://x/'))

    expect(response).toBeInstanceOf(Response)
    expect(handled).toHaveLength(1)
  })
})
