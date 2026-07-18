import { Route } from '../../src/Route'
import { RouterError } from '../../src/errors/RouterError'
import { CallableDispatcher } from '../../src/dispatchers/CallableDispatcher'
import { IIncomingEvent, DispatcherContext, DependencyResolver } from '../../src/declarations'

describe('CallableDispatcher', () => {
  const mockEvent = { test: true } as unknown as IIncomingEvent

  const createContext = (handler: any): DispatcherContext<IIncomingEvent> => {
    const route = { options: { path: '/x', method: 'GET', handler } } as unknown as Route<IIncomingEvent>
    return { event: mockEvent, route }
  }

  it('should return the name as "callable"', () => {
    const dispatcher = new CallableDispatcher({} as unknown as DependencyResolver)
    const route = createContext(vi.fn()).route
    expect(dispatcher.getName(route)).toBe('callable')
  })

  it('should dispatch a plain function handler', async () => {
    const fn = vi.fn(async () => 'done')
    const dispatcher = new CallableDispatcher({} as unknown as DependencyResolver)

    const result = await dispatcher.dispatch(createContext(fn))
    expect(result).toBe('done')
    expect(fn).toHaveBeenCalledWith(mockEvent)
  })

  it('should dispatch a meta function handler', async () => {
    const fn = vi.fn(async () => 'meta')
    const dispatcher = new CallableDispatcher({} as unknown as DependencyResolver)

    const result = await dispatcher.dispatch(createContext({ module: fn }))
    expect(result).toBe('meta')
    expect(fn).toHaveBeenCalledWith(mockEvent)
  })

  it('should dispatch a factory handler', async () => {
    const fn = vi.fn(async () => 'factory-result')
    const factory = vi.fn(() => fn)

    const resolver = {} as unknown as DependencyResolver
    const dispatcher = new CallableDispatcher(resolver)

    const handler = { module: factory, isFactory: true }

    const result = await dispatcher.dispatch(createContext(handler))
    expect(factory).toHaveBeenCalledWith(resolver)
    expect(fn).toHaveBeenCalledWith(mockEvent)
    expect(result).toBe('factory-result')
  })

  it('should throw RouterError on invalid handler', async () => {
    const dispatcher = new CallableDispatcher({} as unknown as DependencyResolver)

    await expect(dispatcher.dispatch(createContext({ invalid: true }))).rejects.toThrow(RouterError)
  })
})
