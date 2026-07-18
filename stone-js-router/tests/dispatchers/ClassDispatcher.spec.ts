import { Route } from '../../src/Route'
import { RouterError } from '../../src/errors/RouterError'
import { ClassDispatcher } from '../../src/dispatchers/ClassDispatcher'
import { IIncomingEvent, DispatcherContext } from '../../src/declarations'

describe('ClassDispatcher', () => {
  const mockEvent = { test: true } as unknown as IIncomingEvent

  const createContext = (handler: any): DispatcherContext<IIncomingEvent> => {
    const route = { options: { path: '/x', method: 'GET', handler } } as unknown as Route<IIncomingEvent>
    return { event: mockEvent, route }
  }

  class TestHandler {
    handle = vi.fn(async () => 'ok')
    get = vi.fn(async () => 'get')
  }

  const createDispatcher = (resolver?: any): any =>
    new ClassDispatcher(resolver)

  it('should return the correct handler name', () => {
    const dispatcher = createDispatcher()
    const handler = { module: TestHandler, isClass: true, action: 'get' }
    const route = Route.create({ path: '/get', method: 'GET', handler })
    expect(dispatcher.getName(route)).toBe('TestHandler@get')
  })

  it('should return the default "handle" action if none specified', () => {
    const dispatcher = createDispatcher()
    const handler = { module: TestHandler, isClass: true }
    const route = Route.create({ path: '/handle', method: 'GET', handler })
    expect(dispatcher.getName(route)).toBe('TestHandler@handle')
  })

  it('should dispatch to a valid action', async () => {
    const instance = new TestHandler()
    const dispatcher = createDispatcher({ resolve: () => instance })
    const handler = { module: TestHandler, isClass: true, action: 'get' }

    const result = await dispatcher.dispatch(createContext(handler))
    expect(result).toBe('get')
    expect(instance.get).toHaveBeenCalledWith(mockEvent)
  })

  it('should dispatch to default "handle" method', async () => {
    const instance = new TestHandler()
    const dispatcher = createDispatcher({ resolve: () => instance })
    const handler = { module: TestHandler, isClass: true }

    const result = await dispatcher.dispatch(createContext(handler))
    expect(result).toBe('ok')
    expect(instance.handle).toHaveBeenCalledWith(mockEvent)
  })

  it('should fallback to manual instantiation if resolver is missing', async () => {
    const dispatcher = createDispatcher(undefined)
    const handler = { module: TestHandler, isClass: true }

    const result = await dispatcher.dispatch(createContext(handler))
    expect(result).toBe('ok')
  })

  it('should throw RouterError if action does not exist', async () => {
    const instance = {}
    const dispatcher = createDispatcher({ resolve: () => instance })
    const handler = { module: TestHandler, isClass: true, action: 'nonexistent' }

    await expect(dispatcher.dispatch(createContext(handler))).rejects.toThrow(RouterError)
  })

  it('should throw RouterError on invalid handler', () => {
    const dispatcher = createDispatcher()
    const route = Route.create({ path: '/', method: 'GET', handler: 'invalid' as any })

    expect(() => dispatcher.getName(route)).toThrow(RouterError)
  })
})
