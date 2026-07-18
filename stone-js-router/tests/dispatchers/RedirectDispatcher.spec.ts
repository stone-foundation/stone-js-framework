import { Route } from '../../src/Route'
import { IIncomingEvent } from '../../src/declarations'
import { RouterError } from '../../src/errors/RouterError'
import { RedirectDispatcher } from '../../src/dispatchers/RedirectDispatcher'

describe('RedirectDispatcher', () => {
  const mockEvent = {} as any

  const createRoute = (redirect: any): any => ({ options: { path: '/redirect', method: 'GET', redirect } }) as unknown as Route<IIncomingEvent>

  const dispatcher = new RedirectDispatcher()

  it('should return "redirect" as handler name', () => {
    const route = createRoute('/home')
    expect(dispatcher.getName(route)).toBe('redirect')
  })

  it('should return response with default 302 for string redirect', async () => {
    const route = createRoute('/home')
    const response = await dispatcher.dispatch({ event: mockEvent, route })
    expect(response).toEqual({ statusCode: 302, headers: { Location: '/home' } })
  })

  it('should support redirect object with custom status', async () => {
    const route = createRoute({ location: '/moved', status: 301 })
    const response = await dispatcher.dispatch({ event: mockEvent, route })
    expect(response).toEqual({ statusCode: 301, headers: { Location: '/moved' } })
  })

  it('should support redirect as a function that returns a string', async () => {
    const route = createRoute(() => '/fn-redirect')
    const response = await dispatcher.dispatch({ event: mockEvent, route })
    expect(response).toEqual({ statusCode: 302, headers: { Location: '/fn-redirect' } })
  })

  it('should support redirect as a function returning a redirect object', async () => {
    const route = createRoute(() => ({ location: '/object-fn', status: 301 }))
    const response = await dispatcher.dispatch({ event: mockEvent, route })
    expect(response).toEqual({ statusCode: 301, headers: { Location: '/object-fn' } })
  })

  it('should throw if no redirect value is provided', async () => {
    const route = createRoute(undefined)
    await expect(dispatcher.dispatch({ event: mockEvent, route })).rejects.toThrow(RouterError)
  })
})
