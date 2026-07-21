import { KeyRouter, collectKeyHandlers } from '@stone-js/key-router'
import { KeyRoutingServiceProvider } from '../src/KeyRoutingServiceProvider'

vi.mock('@stone-js/key-router', async (importOriginal) => {
  const actual: any = await importOriginal()
  return { ...actual, collectKeyHandlers: vi.fn(() => []) }
})

class OnShipped { async handle (): Promise<string> { return 'ok' } }
class Handlers { async onCancelled (): Promise<void> {} }
const fnHandler = vi.fn(async () => 'done')

const makeContainer = (config: any): any => {
  const container: any = {
    make: vi.fn((key: any) => (key === 'blueprint' ? { get: () => config } : new key())),
    instanceIf: vi.fn(() => container),
    alias: vi.fn(() => container)
  }
  return container
}

const routerArg = (c: any): KeyRouter => c.instanceIf.mock.calls.find((call: any[]) => call[0] === KeyRouter)[1]

describe('KeyRoutingServiceProvider', () => {
  afterEach(() => { vi.mocked(collectKeyHandlers).mockReset().mockReturnValue([]) })

  it('binds keyRouter and registers explicit definitions (class + function)', () => {
    const container = makeContainer({ definitions: [
      { key: 'order.shipped', module: OnShipped, isClass: true, action: 'handle' },
      { key: 'built', module: OnShipped, isFactory: true },
      { key: 'ping', module: fnHandler }
    ] })

    new KeyRoutingServiceProvider(container).register()

    expect(container.instanceIf).toHaveBeenCalledWith(KeyRouter, expect.any(KeyRouter))
    expect(container.alias).toHaveBeenCalledWith(KeyRouter, ['keyRouter'])
    const router = routerArg(container)
    expect(router.has('order.shipped')).toBe(true)
    expect(router.has('built')).toBe(true)
    expect(router.has('ping')).toBe(true)
  })

  it('scans @OnKey methods of a handler class', () => {
    vi.mocked(collectKeyHandlers).mockReturnValueOnce([{ key: 'order.cancelled', action: 'onCancelled' }])
    const container = makeContainer({ handlers: [{ module: Handlers, isClass: true }] })

    new KeyRoutingServiceProvider(container).register()

    expect(routerArg(container).has('order.cancelled')).toBe(true)
  })

  it('scans @OnKey on a non-resolvable handler instance', () => {
    vi.mocked(collectKeyHandlers).mockReturnValueOnce([{ key: 'k', action: 'run' }])
    const instance = { run: vi.fn() }
    const container = makeContainer({ handlers: [{ module: instance }] })
    new KeyRoutingServiceProvider(container).register()
    expect(routerArg(container).has('k')).toBe(true)
  })

  it('is a no-op with no definitions or handlers', () => {
    const container = makeContainer({})
    new KeyRoutingServiceProvider(container).register()
    expect(routerArg(container).keys()).toEqual([])
  })
})
