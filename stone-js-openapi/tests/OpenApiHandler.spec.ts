import { OpenApiHandler, DEFAULT_SPEC_PATH } from '../src/OpenApiHandler'

const blueprintOf = (openapi: Record<string, unknown>): any => ({
  get: (key: string, fallback?: unknown) => key === 'stone.openapi' ? openapi : fallback
})

const eventOf = (url?: string): any => (url === undefined ? {} : { url: new URL(url) })

/** A container holding a router, which is now the normal case: deriving is the default. */
const containerOf = (...routes: any[]): any => ({
  has: (key: string) => key === 'router',
  make: () => ({ getRoutes: () => ({ getRoutes: () => routes }) })
})

const routeOf = (path: string, method: string, options: Record<string, unknown> = {}): any => ({
  path,
  method,
  getOption: (key: string, fallback?: unknown) => options[key] ?? fallback
})

describe('OpenApiHandler', () => {
  describe('spec', () => {
    it('advertises the host that answered, not a build-time value', () => {
      // The same artefact runs behind a local port, a load balancer and an API Gateway stage: a URL
      // frozen at build time is wrong for at least two of them.
      const handler = new OpenApiHandler({ container: containerOf(), blueprint: blueprintOf({ info: { title: 'Tasks', version: '2.0.0' } }) })

      const local = handler.spec(eventOf('http://localhost:8080/openapi.json'))
      const prod = handler.spec(eventOf('https://api.example.com/v1/openapi.json?x=1'))

      expect(local.servers).toEqual([{ url: 'http://localhost:8080' }])
      expect(prod.servers).toEqual([{ url: 'https://api.example.com' }])
      expect(prod.info).toEqual({ title: 'Tasks', version: '2.0.0' })
    })

    it('lets configuration override the servers', () => {
      const handler = new OpenApiHandler({
        container: containerOf(),
        blueprint: blueprintOf({ servers: [{ url: 'https://cdn.example.com', description: 'edge' }] })
      })

      expect(handler.spec(eventOf('http://localhost:8080/openapi.json')).servers)
        .toEqual([{ url: 'https://cdn.example.com', description: 'edge' }])
    })

    it('describes the configured routes', () => {
      const handler = new OpenApiHandler({
        container: containerOf(),
        blueprint: blueprintOf({
          routes: [{ path: '/tasks', method: 'get', openapi: { summary: 'List tasks' } }]
        })
      })

      const document = handler.spec(eventOf('http://localhost/openapi.json'))

      expect(document.paths['/tasks']?.get?.summary).toBe('List tasks')
    })

    it('serves a pre-built document untouched when the app assembles its own', () => {
      const document: any = { openapi: '3.1.0', info: { title: 'Mine', version: '9' }, paths: {} }
      const handler = new OpenApiHandler({ container: containerOf(), blueprint: blueprintOf({ document }) })

      expect(handler.spec(eventOf('http://localhost/openapi.json'))).toBe(document)
    })

    it('falls back to `/` when the event carries no usable url', () => {
      const handler = new OpenApiHandler({ container: containerOf(), blueprint: blueprintOf({}) })

      expect(handler.spec(eventOf()).servers).toEqual([{ url: '/' }])
      expect(handler.spec({ url: 'not-a-url' } as any).servers).toEqual([{ url: '/' }])
    })
  })

  describe('docs', () => {
    it('renders an explorer pointing at the spec path', () => {
      const handler = new OpenApiHandler({
        container: containerOf(),
        blueprint: blueprintOf({ specPath: '/v1/openapi.json', info: { title: 'Tasks', version: '1' } })
      })

      const html = handler.docs(eventOf('http://localhost/docs'))

      expect(html).toContain('"/v1/openapi.json"')
      expect(html).toContain('Tasks')
    })

    it('uses the default spec path when none is configured', () => {
      const handler = new OpenApiHandler({ container: containerOf(), blueprint: blueprintOf({}) })

      expect(handler.docs(eventOf('http://localhost/docs'))).toContain(JSON.stringify(DEFAULT_SPEC_PATH))
    })
  })
})

describe('OpenApiHandler: deriving from the router', () => {
  it('derives every path from the routing table, so nothing is restated', () => {
    // The point of the whole chain: a route already says what it is, so the document is a view of
    // the application rather than a second description of it.
    const NameSchema = { validate: () => ({ success: true as const, value: {} }) }
    const handler = new OpenApiHandler({
      container: containerOf(
        routeOf('/users', 'GET', { name: 'users.list' }),
        routeOf('/users', 'POST', { validation: NameSchema, auth: true })
      ),
      blueprint: blueprintOf({ info: { title: 'Tasks', version: '1.0.0' } })
    })

    const document: any = handler.spec(eventOf('http://localhost/openapi.json'))

    expect(Object.keys(document.paths)).toEqual(['/users'])
    expect(document.paths['/users'].get.operationId).toBe('users.list')
    expect(document.paths['/users'].post.security).toEqual([{ bearerAuth: [] }])
  })

  it('refuses to publish a contract with no router, and says what to do', () => {
    // No router means no routes, which means there is no contract. An empty document would be a lie.
    const handler = new OpenApiHandler({
      container: { has: () => false } as any,
      blueprint: blueprintOf({})
    })

    expect(() => handler.spec(eventOf('http://localhost/openapi.json')))
      .toThrow(/without a router.*@Routing\(\)/s)
  })

  it('refuses just as clearly when nothing bound a container at all', () => {
    const handler = new OpenApiHandler({ blueprint: blueprintOf({}) } as any)

    expect(() => handler.spec(eventOf('http://localhost/openapi.json'))).toThrow(/without a router/)
  })

  it('can be told to stop deriving, for a hand-written document', () => {
    const handler = new OpenApiHandler({
      container: { has: () => false } as any,
      blueprint: blueprintOf({ deriveFromRouter: false, routes: [{ path: '/x', method: 'GET', openapi: { summary: 'x' } }] })
    })

    const document: any = handler.spec(eventOf('http://localhost/openapi.json'))

    expect(document.paths['/x'].get.summary).toBe('x')
  })
})

describe('OpenApiHandler: schema classes at request time', () => {
  it('builds a schema class through the container, so its rules get their services', () => {
    // At request time the container is already up, so the served contract is as complete as the one
    // the console command exports.
    class NeedsI18n {
      private readonly label: string
      constructor ({ i18n }: any) { this.label = i18n.t('validation.name') }
      rules (): any { return { body: { validate: () => ({ success: true as const, value: this.label }) } } }
    }

    const container: any = {
      has: (key: string) => key === 'router',
      make: () => ({ getRoutes: () => ({ getRoutes: () => [routeOf('/users', 'POST', { validation: 'createUser' })] }) }),
      resolve: (Class: any) => new Class({ i18n: { t: () => 'translated' } })
    }
    const blueprint: any = {
      get: (key: string, fallback?: unknown) => {
        if (key === 'stone.openapi') return {}
        if (key === 'stone.validation.schemas') return { createUser: NeedsI18n }
        return fallback
      }
    }

    const document: any = new OpenApiHandler({ container, blueprint }).spec(eventOf('http://localhost/openapi.json'))

    expect(document.paths['/users'].post.requestBody).toBeDefined()
  })
})

