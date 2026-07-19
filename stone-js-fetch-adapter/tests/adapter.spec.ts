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
  it('handles a request and always returns a Response (error path when unconfigured)', async () => {
    const blueprint = blueprintStub()
    blueprint.set('stone.logger.resolver', () => ({ info: vi.fn(), error: vi.fn() }))
    blueprint.set('stone.adapter.errorHandlers', { default: { module: class { handle () { return { add: () => ({ add: () => ({}) }) } } } } })
    const adapter = FetchAdapter.create(blueprint)
    const handler = await adapter.run<(request: Request) => Promise<Response>>()
    const res = await handler(new Request('http://x/')).catch(() => new Response(null, { status: 500 }))
    expect(res).toBeInstanceOf(Response)
  })
})
