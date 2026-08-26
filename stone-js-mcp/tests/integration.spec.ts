import { z } from 'zod'
import { McpHandler } from '../src/McpHandler'
import { Tool } from '../src/decorators/Tool'
import { TOOL_KEY } from '../src/decorators/constants'
import { getMetadata } from '@stone-js/core'
import { IncomingHttpEvent, jsonHttpResponse } from '@stone-js/http-core'

/** The real router, holding real routes, dispatching through the real middleware chain. */
const realRouter = async (definitions: any[], middleware: any[] = []): Promise<any> => {
  const { Router } = await import('@stone-js/router')

  return (Router as any).create({
    definitions,
    middleware,
    maxDepth: 5,
    prefix: '',
    strict: false,
    matchers: [],
    rules: {},
    bindings: {},
    defaults: {},
    dispatchers: {
      callable: class {
        static create (): any { return new this() }
        async dispatch ({ route, event }: any): Promise<unknown> {
          return await route.getOption('handler')(event)
        }
      }
    }
  })
}

const handlerOn = (router: any, config: Record<string, unknown> = {}): McpHandler => {
  const bound: Record<string, unknown> = { router, logger: { warn: () => {}, debug: () => {}, error: () => {} } }

  return new McpHandler({
    blueprint: {
      get: (key: string, fallback?: unknown) => (
        key === 'stone.mcp' ? config : (key === 'stone.validation.schemas' ? (config.schemas ?? {}) : fallback)
      )
    } as any,
    container: {
      has: (key: unknown) => typeof key === 'string' && key in bound,
      make: (key: unknown) => bound[key as string]
    } as any
  })
}

const ask = async (handler: McpHandler, body: unknown, headers: Record<string, string> = {}): Promise<any> => {
  const response: any = await handler.handle(IncomingHttpEvent.create({
    url: new URL('http://api.test/mcp'),
    method: 'POST',
    source: { rawEvent: {}, platform: 'test' } as any,
    ip: '1.2.3.4',
    headers,
    body: body as any
  }))

  return response.content
}

describe('a tool call goes through the chain that protects the route', () => {
  it('runs the route middleware, in order, before the handler', async () => {
    // This is the reason a tool is a route rather than a second registration. Every guard an
    // application already wrote applies to an agent without being written again.
    const order: string[] = []

    const guard = {
      module: async (event: any, next: any) => { order.push('guard'); return await next(event) },
      priority: 1
    }

    const router = await realRouter([{
      path: '/notes',
      method: 'POST',
      name: 'notes.create',
      mcp: { name: 'create-note', description: 'Create a note.' },
      middleware: [guard],
      handler: (event: any) => { order.push('handler'); return jsonHttpResponse({ id: 1, title: event.get('title') }, 201) }
    }])

    const result = await ask(handlerOn(router), {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'create-note', arguments: { title: 'Thursday' } }
    })

    expect(order).toEqual(['guard', 'handler'])
    expect(JSON.parse(result.result.content[0].text)).toEqual({ id: 1, title: 'Thursday' })
  })

  it('is refused by the route own guard, and the refusal reaches the agent as a result', async () => {
    // A guard that denies is the case that matters: the agent is told, in words, and can explain
    // it. Nothing about the exchange breaks, and nothing was bypassed.
    const router = await realRouter([{
      path: '/notes',
      method: 'POST',
      name: 'notes.create',
      mcp: { name: 'create-note', description: 'Create a note.' },
      middleware: [{
        module: async () => { throw new Error('You may not create notes here.') },
        priority: 1
      }],
      handler: () => jsonHttpResponse({ id: 1 }, 201)
    }])

    const result = await ask(handlerOn(router), {
      jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'create-note', arguments: {} }
    })

    expect(result.result).toMatchObject({ isError: true })
    expect(result.result.content[0].text).toBe('You may not create notes here.')
  })

  it('binds the path parameters, so the handler reads them as it always does', async () => {
    const router = await realRouter([{
      path: '/orgs/:orgCode/notes/:id',
      method: 'GET',
      name: 'notes.show',
      mcp: { name: 'get-note', description: 'Read one note.' },
      handler: (event: any) => jsonHttpResponse({ org: event.getParam('orgCode'), id: event.getParam('id') }, 200)
    }])

    const result = await ask(handlerOn(router), {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'get-note', arguments: { orgCode: 'acme', id: '42' } }
    })

    expect(JSON.parse(result.result.content[0].text)).toEqual({ org: 'acme', id: '42' })
  })

  it('lists exactly the routes that said so, through the real router', async () => {
    const router = await realRouter([
      { path: '/notes', method: 'GET', name: 'notes.list', mcp: { name: 'list-notes', description: 'List.' }, handler: () => [] },
      { path: '/health', method: 'GET', name: 'health', handler: () => ({}) }
    ])

    const result = await ask(handlerOn(router), { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.result.tools.map((t: any) => t.name)).toEqual(['list-notes'])
  })
})

describe('what the rest of the application already declared', () => {
  it('takes the arguments from the validation schema, converted', async () => {
    // An application that already says what a request must contain should not say it twice. The
    // conversion is `@stone-js/openapi`'s, because it already knows how.
    const router = await realRouter([{
      path: '/notes',
      method: 'POST',
      name: 'notes.create',
      mcp: { name: 'create-note', description: 'Create a note.' },
      validation: 'createNote',
      handler: () => ({})
    }])

    const schemas = { createNote: z.object({ title: z.string(), pinned: z.boolean().optional() }) }
    const result = await ask(handlerOn(router, { schemas }), { jsonrpc: '2.0', id: 1, method: 'tools/list' })
    const schema = result.result.tools[0].inputSchema

    expect(schema.type).toBe('object')
    expect(Object.keys(schema.properties)).toEqual(['title', 'pinned'])
    expect(schema.required).toEqual(['title'])
  })

  it('falls back to the path parameters when the named schema is not registered', async () => {
    // A schema that cannot be read leaves the tool with a poorer one, which is recoverable. Letting
    // the failure out would take down the whole listing, which is not.
    const router = await realRouter([{
      path: '/notes/:id',
      method: 'GET',
      name: 'notes.show',
      mcp: { name: 'get-note', description: 'Read.' },
      validation: 'nowhere',
      handler: () => ({})
    }])

    const result = await ask(handlerOn(router), { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.result.tools[0].inputSchema.properties).toHaveProperty('id')
  })

  it('lets the declaration override every derivation', async () => {
    const router = await realRouter([{
      path: '/notes',
      method: 'POST',
      name: 'notes.create',
      validation: 'createNote',
      openapi: { summary: 'Derived summary.' },
      mcp: {
        name: 'create-note',
        description: 'Stated description.',
        inputSchema: { type: 'object', properties: { anything: { type: 'string' } } }
      },
      handler: () => ({})
    }])

    const schemas = { createNote: z.object({ title: z.string() }) }
    const result = await ask(handlerOn(router, { schemas }), { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.result.tools[0].description).toBe('Stated description.')
    expect(Object.keys(result.result.tools[0].inputSchema.properties)).toEqual(['anything'])
  })
})

describe('declaring a tool on the handler instead of the route', () => {
  it('records the declaration against the method, like @Validate and @Returns do', () => {
    class NotesController {
      @Tool({ name: 'create-note', description: 'Create a note.' })
      create (): object { return {} }
    }

    expect(getMetadata(NotesController, TOOL_KEY, [])).toEqual([
      { action: 'create', mcp: { name: 'create-note', description: 'Create a note.' } }
    ])
  })

  it('is read when the route itself says nothing', async () => {
    class NotesController {
      @Tool({ name: 'create-note', description: 'Create a note.' })
      create (): unknown { return jsonHttpResponse({ id: 1 }, 201) }
    }

    const router = await realRouter([{
      path: '/notes',
      method: 'POST',
      name: 'notes.create',
      handler: { module: NotesController, action: 'create' } as any
    }])

    // The dispatcher above calls the handler option directly, so the route is listed from the
    // handler's metadata: what is under test here is the reading, not the dispatch.
    const result = await ask(handlerOn(router), { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.result.tools[0]).toMatchObject({ name: 'create-note', description: 'Create a note.' })
  })

  it('lets the route win when both said something', async () => {
    // With a router in play, a route is the single description of itself.
    class NotesController {
      @Tool({ name: 'from-the-handler', description: 'Handler.' })
      create (): object { return {} }
    }

    const router = await realRouter([{
      path: '/notes',
      method: 'POST',
      name: 'notes.create',
      mcp: { name: 'from-the-route', description: 'Route.' },
      handler: { module: NotesController, action: 'create' } as any
    }])

    const result = await ask(handlerOn(router), { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.result.tools[0].name).toBe('from-the-route')
  })
})
