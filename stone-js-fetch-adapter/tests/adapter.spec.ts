import { Logger } from '@stone-js/core'
import { FETCH_PLATFORM } from '../src/constants'
import { Fetch } from '../src/decorators/Fetch'
import { FetchAdapter } from '../src/FetchAdapter'
import { fetchAdapterResolver } from '../src/resolvers'
import { fetchAdapterBlueprint } from '../src/options/FetchAdapterBlueprint'

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

describe('fetchAdapterBlueprint', () => {
  it('registers the fetch adapter with its middleware, resolver and error handler', () => {
    const adapter = fetchAdapterBlueprint.stone.adapters?.[0]
    expect(adapter?.platform).toBe(FETCH_PLATFORM)
    expect(adapter?.resolver).toBe(fetchAdapterResolver)
    expect(adapter?.middleware).toHaveLength(2)
    expect(adapter?.errorHandlers?.default).toBeDefined()
  })
})

describe('fetchAdapterResolver', () => {
  it('creates a FetchAdapter', () => {
    expect(fetchAdapterResolver(blueprintStub())).toBeInstanceOf(FetchAdapter)
  })
})

describe('FetchAdapter', () => {
  it('runs and returns a Fetch handler function', async () => {
    const blueprint = blueprintStub()
    blueprint.set('stone.logger.resolver', () => ({ info: vi.fn(), error: vi.fn() }))
    const adapter = FetchAdapter.create(blueprint)
    const handler = await adapter.run<(request: Request) => Promise<Response>>()
    expect(typeof handler).toBe('function')
  })
})

describe('@Fetch', () => {
  it('applies the fetch adapter blueprint to a class (with merged options)', () => {
    expect(() => {
      @Fetch({ default: true })
      class App {}
      return App
    }).not.toThrow()
  })
})

describe('FetchAdapter dispatch', () => {
  it('answers rather than throwing when the application is not configured', async () => {
    // An adapter that throws out of the platform handler answers nothing at all: the runtime turns
    // that into its own opaque failure, and the caller learns less than a 500 would tell them. So the
    // error path is asserted, not tolerated: the previous version of this test caught the rejection
    // and accepted either outcome, which is why the branch was never covered.
    const handled: unknown[] = []
    const blueprint = blueprintStub()

    blueprint.set('stone.logger.resolver', () => ({ info: vi.fn(), error: vi.fn() }))
    // The dotted key the kernel reads, not the object above it: this stub is a flat map, where the
    // real `Config` walks a path. The previous version set the parent and the lookup found nothing,
    // so the error handler was never reached and the test proved nothing.
    blueprint.set('stone.adapter.errorHandlers.default', {
      isClass: true,
      module: class {
        handle (error: unknown): any {
          handled.push(error)
          // What the kernel does with it: `build().respond()`. Answering that shape is what proves
          // the platform handler returns a Response instead of rejecting.
          return { build: () => ({ respond: () => new Response(null, { status: 500 }) }) }
        }
      }
    })

    const adapter = FetchAdapter.create(blueprint)
    const handler = await adapter.run<(request: Request) => Promise<Response>>()
    const response = await handler(new Request('http://x/'))

    expect(response).toBeInstanceOf(Response)
    expect(handled).toHaveLength(1)
  })

  it('carries a request through its own middleware and answers a Response', async () => {
    // The one test the package did not have: a real `Request` in, a real `Response` out, through the
    // middleware the blueprint actually registers. Everything else here asserted a piece in isolation,
    // so the whole path from the platform handler to the answer was never once executed. It is also
    // the only test that would notice the shared normalizer being wired up wrong.
    const blueprint = blueprintStub()
    let seen: any

    blueprint.set('stone.logger.resolver', () => ({ info: vi.fn(), error: vi.fn() }))
    // The middleware are resolved with the running logger, so it has to exist before the pipeline
    // does: `Logger.getInstance()` throws otherwise, and the adapter would report a logging failure
    // as a failed request.
    Logger.init(blueprint)
    blueprint.set('stone.adapter.middleware', fetchAdapterBlueprint.stone.adapters?.[0].middleware)
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

    const adapter = FetchAdapter.create(blueprint)
    const handler = await adapter.run<(request: Request) => Promise<Response>>()
    const response = await handler(new Request('https://api.test/users?page=2', {
      method: 'POST',
      body: '{"name":"stone"}',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '9.9.9.9' }
    }))

    // What the handler received: the request, normalized into an intention.
    expect(seen.method).toBe('POST')
    expect(seen.pathname).toBe('/users')
    expect(seen.ip).toBe('9.9.9.9')

    // And what the platform received back.
    expect(response.status).toBe(201)
    expect(response.headers.get('content-type')).toBe('application/json')
    expect(await response.json()).toEqual({ ok: true })
  })
})
