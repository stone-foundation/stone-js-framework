import { Route } from '../../src/Route'
import { RouterError } from '../../src/errors/RouterError'
import { ComponentDispatcher } from '../../src/dispatchers/ComponentDispatcher'
import { IIncomingEvent, MetaComponentEventHandler } from '../../src/declarations'

describe('ComponentDispatcher', () => {
  const createRoute = (handler: any): any => ({ options: { path: '/component', method: 'GET', handler } }) as unknown as Route<IIncomingEvent>

  const createDispatcher = (resolver: any = {}): any =>
    new ComponentDispatcher(resolver)

  const DummyComponent = { isComponent: true }

  it('should dispatch a component directly if valid', () => {
    const dispatcher = createDispatcher()
    const route = createRoute(DummyComponent)
    const result = dispatcher.dispatch({ route, event: {} as any })
    expect(result).toBe(DummyComponent)
  })

  it('should throw if handler is not a valid component', () => {
    const dispatcher = createDispatcher()
    const route = createRoute(undefined)
    expect(() => dispatcher.dispatch({ route, event: {} as any })).toThrow(RouterError)
  })

  it('should delegate getName to CallableDispatcher if handler is callable', async () => {
    const fn = vi.fn()
    const route = createRoute(fn)
    const dispatcher = createDispatcher()

    const name = await dispatcher.getName(route)
    expect(name).toBe('callable')
  })

  it('should delegate getName to ClassDispatcher if handler is a class', async () => {
    class MyComponent {
      handle (): void {}
    }

    const route = createRoute({ module: MyComponent, isClass: true, action: 'handle', isComponent: true })
    const dispatcher = createDispatcher()

    const name = await dispatcher.getName(route)
    expect(name).toBe('MyComponent@handle')
  })

  it('should resolve lazy component handler module and delegate correctly', async () => {
    const LazyClass = class LazyClass { handle (): void {} }

    const route = createRoute({
      module: vi.fn(async () => LazyClass),
      action: 'handle',
      isClass: true,
      isComponent: true,
      lazy: true
    })

    const dispatcher = createDispatcher()

    const name = await dispatcher.getName(route)
    const handler = route.options.handler as MetaComponentEventHandler<IIncomingEvent>

    expect(name).toBe('LazyClass@handle')
    expect(handler.lazy).toBe(false)
    expect(typeof handler.module).toBe('function') // should now be resolved
  })

  it('should not re-resolve if lazy flag is already false', async () => {
    const fn = vi.fn(() => DummyComponent)

    const handler = {
      module: fn,
      lazy: false,
      isComponent: true
    }

    const route = createRoute(handler)
    const dispatcher = createDispatcher()
    await dispatcher.getName(route)
    expect(fn).not.toHaveBeenCalled()
  })
})
