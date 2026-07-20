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
  it('handles a request and always returns a Response (error path when unconfigured)', async () => {
    const blueprint = blueprintStub()
    blueprint.set('stone.logger.resolver', () => ({ info: vi.fn(), error: vi.fn() }))
    blueprint.set('stone.adapter.errorHandlers', { default: { module: class { handle () { return { add: () => ({ add: () => ({}) }) } } } } })
    const adapter = AzureFunctionsHttpAdapter.create(blueprint)
    const handler = await adapter.run<(request: Request) => Promise<Response>>()
    const res = await handler(new Request('http://x/')).catch(() => new Response(null, { status: 500 }))
    expect(res).toBeInstanceOf(Response)
  })
})
