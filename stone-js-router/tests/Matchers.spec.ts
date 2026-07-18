import { Route } from '../src/Route'
import { IIncomingEvent, IOutgoingResponse } from '../src/declarations'
import { MatcherOptions, hostMatcher, methodMatcher, protocolMatcher, uriMatcher } from '../src/matchers'

// Behavioural tests: exercise the real pattern -> regex -> match chain (no mocking of
// `utils`/`Route`), so a regression in the compiled regexes is actually caught here.
const makeRoute = (options: any): Route<IIncomingEvent, IOutgoingResponse> =>
  Route.create<IIncomingEvent, IOutgoingResponse>({ handler: () => ({} as any), ...options })

const makeEvent = (over: Partial<IIncomingEvent> = {}): IIncomingEvent => ({
  host: 'example.com',
  method: 'GET',
  isSecure: true,
  decodedPathname: '/test',
  pathname: '/test',
  ...over
} as unknown as IIncomingEvent)

describe('Matchers', () => {
  describe('hostMatcher', () => {
    it('should return true when the route has no domain constraint', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent(),
        route: makeRoute({ method: 'GET', path: '/test' })
      }
      expect(hostMatcher(options)).toBe(true)
    })

    it('should return true when the host matches the domain constraint', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent({ host: 'api.example.com' }),
        route: makeRoute({ method: 'GET', path: '/test', domain: '{tenant}.example.com' })
      }
      expect(hostMatcher(options)).toBe(true)
    })

    it('should return false when the host does not match the domain constraint', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent({ host: 'api.evil.com' }),
        route: makeRoute({ method: 'GET', path: '/test', domain: '{tenant}.example.com' })
      }
      expect(hostMatcher(options)).toBe(false)
    })
  })

  describe('methodMatcher', () => {
    it('should return true if route method matches event method', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent({ method: 'GET' }),
        route: makeRoute({ method: 'GET', path: '/test' })
      }
      expect(methodMatcher(options)).toBe(true)
    })

    it('should return false if route method does not match event method', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent({ method: 'POST' }),
        route: makeRoute({ method: 'GET', path: '/test' })
      }
      expect(methodMatcher(options)).toBe(false)
    })
  })

  describe('protocolMatcher', () => {
    it('should return false if route is force-http and event is secure', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent({ isSecure: true }),
        route: makeRoute({ method: 'GET', path: '/test', protocolPolicy: 'force-http' })
      }
      expect(protocolMatcher(options)).toBe(false)
    })

    it('should return true if route is force-http and event is not secure', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent({ isSecure: false }),
        route: makeRoute({ method: 'GET', path: '/test', protocolPolicy: 'force-http' })
      }
      expect(protocolMatcher(options)).toBe(true)
    })

    it('should return true if route is force-https and event is secure', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent({ isSecure: true }),
        route: makeRoute({ method: 'GET', path: '/test', protocolPolicy: 'force-https' })
      }
      expect(protocolMatcher(options)).toBe(true)
    })

    it('should return false if route is force-https and event is not secure', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent({ isSecure: false }),
        route: makeRoute({ method: 'GET', path: '/test', protocolPolicy: 'force-https' })
      }
      expect(protocolMatcher(options)).toBe(false)
    })

    it('should return true if no protocol restrictions are set', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent(),
        route: makeRoute({ method: 'GET', path: '/test' })
      }
      expect(protocolMatcher(options)).toBe(true)
    })
  })

  describe('uriMatcher', () => {
    it('should return true if the path regex matches the event pathname', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent({ decodedPathname: '/test/42', pathname: '/test/42' }),
        route: makeRoute({ method: 'GET', path: '/test/:id' })
      }
      expect(uriMatcher(options)).toBe(true)
    })

    it('should fall back to pathname when decodedPathname is undefined', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent({ decodedPathname: undefined, pathname: '/test/42' }),
        route: makeRoute({ method: 'GET', path: '/test/:id' })
      }
      expect(uriMatcher(options)).toBe(true)
    })

    it('should return false if the path regex does not match the event pathname', () => {
      const options: MatcherOptions<IIncomingEvent, IOutgoingResponse> = {
        event: makeEvent({ decodedPathname: '/other', pathname: '/other' }),
        route: makeRoute({ method: 'GET', path: '/test/:id' })
      }
      expect(uriMatcher(options)).toBe(false)
    })
  })
})
