import { OpenApiHandler, DEFAULT_SPEC_PATH } from '../src/OpenApiHandler'

const blueprintOf = (openapi: Record<string, unknown>): any => ({
  get: (key: string, fallback?: unknown) => key === 'stone.openapi' ? openapi : fallback
})

const eventOf = (url?: string): any => (url === undefined ? {} : { url: new URL(url) })

describe('OpenApiHandler', () => {
  describe('spec', () => {
    it('advertises the host that answered, not a build-time value', () => {
      // The same artefact runs behind a local port, a load balancer and an API Gateway stage: a URL
      // frozen at build time is wrong for at least two of them.
      const handler = new OpenApiHandler({ blueprint: blueprintOf({ info: { title: 'Tasks', version: '2.0.0' } }) })

      const local = handler.spec(eventOf('http://localhost:8080/openapi.json'))
      const prod = handler.spec(eventOf('https://api.example.com/v1/openapi.json?x=1'))

      expect(local.servers).toEqual([{ url: 'http://localhost:8080' }])
      expect(prod.servers).toEqual([{ url: 'https://api.example.com' }])
      expect(prod.info).toEqual({ title: 'Tasks', version: '2.0.0' })
    })

    it('lets configuration override the servers', () => {
      const handler = new OpenApiHandler({
        blueprint: blueprintOf({ servers: [{ url: 'https://cdn.example.com', description: 'edge' }] })
      })

      expect(handler.spec(eventOf('http://localhost:8080/openapi.json')).servers)
        .toEqual([{ url: 'https://cdn.example.com', description: 'edge' }])
    })

    it('describes the configured routes', () => {
      const handler = new OpenApiHandler({
        blueprint: blueprintOf({
          routes: [{ path: '/tasks', method: 'get', openapi: { summary: 'List tasks' } }]
        })
      })

      const document = handler.spec(eventOf('http://localhost/openapi.json'))

      expect(document.paths['/tasks']?.get?.summary).toBe('List tasks')
    })

    it('serves a pre-built document untouched when the app assembles its own', () => {
      const document: any = { openapi: '3.1.0', info: { title: 'Mine', version: '9' }, paths: {} }
      const handler = new OpenApiHandler({ blueprint: blueprintOf({ document }) })

      expect(handler.spec(eventOf('http://localhost/openapi.json'))).toBe(document)
    })

    it('falls back to `/` when the event carries no usable url', () => {
      const handler = new OpenApiHandler({ blueprint: blueprintOf({}) })

      expect(handler.spec(eventOf()).servers).toEqual([{ url: '/' }])
      expect(handler.spec({ url: 'not-a-url' } as any).servers).toEqual([{ url: '/' }])
    })
  })

  describe('docs', () => {
    it('renders an explorer pointing at the spec path', () => {
      const handler = new OpenApiHandler({
        blueprint: blueprintOf({ specPath: '/v1/openapi.json', info: { title: 'Tasks', version: '1' } })
      })

      const html = handler.docs(eventOf('http://localhost/docs'))

      expect(html).toContain('"/v1/openapi.json"')
      expect(html).toContain('Tasks')
    })

    it('uses the default spec path when none is configured', () => {
      const handler = new OpenApiHandler({ blueprint: blueprintOf({}) })

      expect(handler.docs(eventOf('http://localhost/docs'))).toContain(JSON.stringify(DEFAULT_SPEC_PATH))
    })
  })
})
