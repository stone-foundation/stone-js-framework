import { z } from 'zod'
import { IncomingHttpEvent } from '@stone-js/http-core'

const route = (options: Record<string, unknown>): any => ({
  getOption: <T>(key: string, fallback?: T) => (options[key] as T) ?? fallback
})

const ask = async (handler: any, body: unknown): Promise<any> => {
  const response: any = await handler.handle(IncomingHttpEvent.create({
    url: new URL('http://api.test/mcp'),
    method: 'POST',
    source: { rawEvent: {}, platform: 'test' } as any,
    ip: '1.2.3.4',
    body: body as any
  }))

  return response.content
}

describe('when the contract package is not installed', () => {
  it('still exposes the tool, taking its arguments from the path', async () => {
    // The derivation from a validation schema is a convenience, not a requirement. An application
    // without `@stone-js/openapi` gets a poorer schema and a working tool, which is the degradation
    // this module is built around: it must not need a stack to be useful.
    vi.resetModules()
    vi.doMock('@stone-js/openapi', () => { throw new Error('not installed') })

    const { McpHandler } = await import('../src/McpHandler')

    const bound: Record<string, unknown> = {
      router: {
        getRoutes: () => ({
          getRoutes: () => [route({
            path: '/notes/:id',
            method: 'GET',
            name: 'n',
            mcp: { name: 'get-note', description: 'Read.' },
            validation: z.object({ title: z.string() })
          })]
        }),
        dispatch: async () => 'ok'
      },
      logger: { warn: () => {}, debug: () => {}, error: () => {} }
    }

    const handler = new McpHandler({
      blueprint: { get: (k: string, f?: unknown) => (k === 'stone.mcp' ? {} : f) } as any,
      container: { has: (k: unknown) => typeof k === 'string' && k in bound, make: (k: unknown) => bound[k as string] } as any
    })

    const result = await ask(handler, { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.result.tools[0].inputSchema.properties).toHaveProperty('id')

    vi.doUnmock('@stone-js/openapi')
    vi.resetModules()
  })
})

describe('an event that carries less than an HTTP request usually does', () => {
  it('still dispatches a tool call', async () => {
    // A test client, a queue consumer replaying a call, an adapter that reports no address: none of
    // them should make a tool unavailable.
    const dispatched: any[] = []
    const { McpHandler } = await import('../src/McpHandler')

    const bound: Record<string, unknown> = {
      router: {
        getRoutes: () => ({ getRoutes: () => [route({ path: '/notes', method: 'POST', name: 'n', mcp: { name: 'create', description: 'Create.' } })] }),
        dispatch: async (e: any) => { dispatched.push(e); return null }
      }
    }

    const handler = new McpHandler({
      blueprint: { get: (k: string, f?: unknown) => (k === 'stone.mcp' ? {} : f) } as any,
      container: { has: (k: unknown) => typeof k === 'string' && k in bound, make: (k: unknown) => bound[k as string] } as any
    })

    const event: any = IncomingHttpEvent.create({
      url: new URL('http://api.test/mcp'),
      method: 'POST',
      source: { rawEvent: {}, platform: 'test' } as any,
      ip: '',
      body: { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'create', arguments: {} } } as any
    })

    const response: any = await handler.handle(event)

    expect(dispatched).toHaveLength(1)
    expect(response.content.result.content[0].text).toBe('null')
  })
})
