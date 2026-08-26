import { z } from 'zod'
import { McpHandler } from '../src/McpHandler'
import { IncomingHttpEvent } from '@stone-js/http-core'
import { McpConfigurationError } from '../src/errors/McpError'

const route = (options: Record<string, unknown>): any => ({
  getOption: <T>(key: string, fallback?: T) => (options[key] as T) ?? fallback
})

const handlerFor = (options: {
  routes?: any[]
  config?: Record<string, unknown>
  schemas?: Record<string, unknown>
  logger?: boolean
  router?: boolean
  resolve?: (target: any) => unknown
} = {}): { handler: McpHandler, warnings: any[] } => {
  const warnings: any[] = []
  const bound: Record<string, unknown> = {}

  if (options.router !== false) {
    bound.router = {
      getRoutes: () => ({ getRoutes: () => options.routes ?? [] }),
      dispatch: async () => ({ content: 'done' })
    }
  }

  if (options.logger !== false) {
    bound.logger = { warn: (...args: any[]) => warnings.push(args), debug: () => {}, error: () => {} }
  }

  const handler = new McpHandler({
    blueprint: {
      get: (key: string, fallback?: unknown) => {
        if (key === 'stone.mcp') { return options.config ?? {} }
        if (key === 'stone.validation.schemas') { return options.schemas ?? {} }
        if (key === 'stone.name') { return 'my-app' }
        return fallback
      }
    } as any,
    container: {
      has: (key: unknown) => typeof key === 'string' && key in bound,
      make: (key: unknown) => bound[key as string],
      resolve: options.resolve
    } as any
  })

  return { handler, warnings }
}

const ask = async (handler: McpHandler, body: unknown): Promise<any> => {
  const response: any = await handler.handle(IncomingHttpEvent.create({
    url: new URL('http://api.test/mcp'),
    method: 'POST',
    source: { rawEvent: {}, platform: 'test' } as any,
    ip: '1.2.3.4',
    body: body as any
  }))

  return response.content
}

const listing = async (handler: McpHandler): Promise<any> =>
  (await ask(handler, { jsonrpc: '2.0', id: 1, method: 'tools/list' })).result?.tools

describe('what the server says it is', () => {
  it('names itself after the application, and carries the instructions it was given', async () => {
    // The place to say what this API is for and how its tools relate, which no single tool
    // description can carry.
    const { handler } = handlerFor({ config: { instructions: 'Read before you write.', version: '2.1.0' } })

    const result = await ask(handler, { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} })

    expect(result.result.serverInfo).toEqual({ name: 'my-app', version: '2.1.0' })
    expect(result.result.instructions).toBe('Read before you write.')
  })

  it('answers a name of its own when the application gave one', async () => {
    const { handler } = handlerFor({ config: { name: 'notes-tools' } })

    const result = await ask(handler, { jsonrpc: '2.0', id: 1, method: 'initialize' })

    expect(result.result.serverInfo).toEqual({ name: 'notes-tools', version: '0.0.0' })
    expect(result.result.instructions).toBeUndefined()
  })
})

describe('without a router', () => {
  it('says there are no routes, rather than answering an empty tool list', async () => {
    // An empty list reads as "this API offers nothing", which an agent believes. A setup mistake has
    // to look like one, or it is never fixed.
    const { handler } = handlerFor({ router: false })

    const result = await ask(handler, { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.error.message).toContain('Cannot expose tools without a router')
    expect(new McpConfigurationError('x').code).toBe('MCP_CONFIGURATION_ERROR')
  })
})

describe('deciding what is exposed', () => {
  it('leaves out a tool with no description when the application asks for that', async () => {
    const { handler, warnings } = handlerFor({
      config: { requireDescription: true },
      routes: [route({ path: '/notes', method: 'POST', name: 'notes.create', mcp: 'create-note' })]
    })

    expect(await listing(handler)).toHaveLength(0)
    expect(warnings.some(([m]) => String(m).includes('requireDescription'))).toBe(true)
  })

  it('gives the application the last word, for what a declaration cannot know', async () => {
    // An environment, a flag, a caller: things a route cannot state about itself.
    const { handler } = handlerFor({
      config: { filter: (tool: any) => tool.name !== 'dangerous' },
      routes: [
        route({ path: '/a', method: 'GET', name: 'a', mcp: { name: 'safe', description: 'Safe.' } }),
        route({ path: '/b', method: 'POST', name: 'b', mcp: { name: 'dangerous', description: 'No.' } })
      ]
    })

    expect((await listing(handler)).map((t: any) => t.name)).toEqual(['safe'])
  })

  it('keeps the first of two routes claiming one tool name, and says so', async () => {
    // An agent would otherwise experience a tool that sometimes does something else.
    const { handler, warnings } = handlerFor({
      routes: [
        route({ path: '/notes', method: 'POST', name: 'a', mcp: { name: 'create', description: 'First.' } }),
        route({ path: '/drafts', method: 'POST', name: 'b', mcp: { name: 'create', description: 'Second.' } })
      ]
    })

    const tools = await listing(handler)

    expect(tools).toHaveLength(1)
    expect(tools[0].description).toBe('First.')
    expect(warnings.some(([m]) => String(m).includes("claim the tool name 'create'"))).toBe(true)
  })

  it('falls back to the route name when the declaration names no tool', async () => {
    const { handler } = handlerFor({
      routes: [route({ path: '/notes', method: 'GET', name: 'notes.list', mcp: { description: 'List.' } })]
    })

    expect((await listing(handler))[0].name).toBe('notes.list')
  })

  it('carries the annotations a route declared', async () => {
    const { handler } = handlerFor({
      routes: [route({
        path: '/notes',
        method: 'GET',
        name: 'notes.list',
        mcp: { name: 'list-notes', description: 'List.', annotations: { readOnlyHint: true } }
      })]
    })

    expect((await listing(handler))[0].annotations).toEqual({ readOnlyHint: true })
  })
})

describe('reading a schema the application registered', () => {
  it('builds a schema class through the container, so its rules get their services', async () => {
    // A schema whose rules need a service is only readable when something can build it. Without the
    // container it would be skipped, and the tool would take less than it should.
    class CreateNote {
      rules (): unknown { return z.object({ title: z.string() }) }
    }

    const built = new CreateNote()
    const { handler } = handlerFor({
      routes: [route({ path: '/notes', method: 'POST', name: 'n', mcp: { name: 'create', description: 'Create.' }, validation: 'createNote' })],
      schemas: { createNote: CreateNote },
      resolve: () => built
    })

    const schema = (await listing(handler))[0].inputSchema

    expect(Object.keys(schema.properties ?? {})).toEqual(['title'])
  })

  it('falls back to the path when the class cannot be built', async () => {
    class Unbuildable {}

    const { handler } = handlerFor({
      routes: [route({ path: '/notes/:id', method: 'GET', name: 'n', mcp: { name: 'get', description: 'Read.' }, validation: 'x' })],
      schemas: { x: Unbuildable },
      resolve: () => { throw new Error('nope') }
    })

    expect((await listing(handler))[0].inputSchema.properties).toHaveProperty('id')
  })

  it('falls back to the path when what was declared is not an object schema', async () => {
    const { handler, warnings } = handlerFor({
      routes: [route({ path: '/notes/:id', method: 'GET', name: 'n', mcp: { name: 'get', description: 'Read.' }, validation: z.string() })]
    })

    expect((await listing(handler))[0].inputSchema.properties).toHaveProperty('id')
    expect(warnings.filter(([m]) => String(m).includes('could not be described'))).toHaveLength(0)
  })

  it('reads a schema stated outright on the route', async () => {
    const { handler } = handlerFor({
      routes: [route({
        path: '/notes',
        method: 'POST',
        name: 'n',
        mcp: { name: 'create', description: 'Create.' },
        validation: z.object({ title: z.string() })
      })]
    })

    expect(Object.keys((await listing(handler))[0].inputSchema.properties)).toEqual(['title'])
  })
})

describe('with nothing bound but a router', () => {
  it('still lists and still calls, because a logger is a convenience', async () => {
    const { handler } = handlerFor({
      logger: false,
      routes: [route({ path: '/notes', method: 'GET', name: 'n', mcp: 'list-notes' })]
    })

    expect(await listing(handler)).toHaveLength(1)

    const result = await ask(handler, {
      jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'list-notes', arguments: {} }
    })

    expect(result.result.content[0].text).toBe('done')
  })
})

describe('the edges of a tool call', () => {
  it('leaves a path parameter in place when the agent did not send it', async () => {
    // The route then fails to match, and the agent is told so as a result. Substituting an empty
    // string would call a different endpoint, silently.
    const dispatched: any[] = []
    const handler = new McpHandler({
      blueprint: { get: (k: string, f?: unknown) => (k === 'stone.mcp' ? {} : f) } as any,
      container: {
        has: (k: unknown) => k === 'router',
        make: () => ({
          getRoutes: () => ({ getRoutes: () => [route({ path: '/notes/:id', method: 'GET', name: 'n', mcp: { name: 'get', description: 'Read.' } })] }),
          dispatch: async (e: any) => { dispatched.push(e); return 'ok' }
        })
      } as any
    })

    await ask(handler, { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'get', arguments: {} } })

    expect(dispatched[0].pathname).toBe('/notes/:id')
  })

  it('strips a route constraint when filling the path', async () => {
    // A path may constrain a parameter (`:id(\\d+)`). The constraint is how the route matches, never
    // part of the value.
    const dispatched: any[] = []
    const handler = new McpHandler({
      blueprint: { get: (k: string, f?: unknown) => (k === 'stone.mcp' ? {} : f) } as any,
      container: {
        has: (k: unknown) => k === 'router',
        make: () => ({
          getRoutes: () => ({ getRoutes: () => [route({ path: '/notes/:id(\\d+)', method: 'GET', name: 'n', mcp: { name: 'get', description: 'Read.' } })] }),
          dispatch: async (e: any) => { dispatched.push(e); return 'ok' }
        })
      } as any
    })

    await ask(handler, { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'get', arguments: { id: 42 } } })

    expect(dispatched[0].pathname).toBe('/notes/42')
  })

  it('answers a plain string as it is, without wrapping it in JSON', async () => {
    const { handler } = handlerFor({
      routes: [route({ path: '/notes', method: 'GET', name: 'n', mcp: { name: 'list', description: 'List.' } })]
    })

    const result = await ask(handler, { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'list', arguments: {} } })

    expect(result.result.content[0].text).toBe('done')
  })

  it('reads a declaration a handler made, for the action the route dispatches to', async () => {
    // The same two places every first-party module reads: the route, then the handler's decorator.
    const { Tool } = await import('../src/decorators/Tool')

    class NotesController {
      @Tool({ name: 'from-handler', description: 'Handler said so.' })
      create (): object { return {} }
    }

    const { handler } = handlerFor({
      routes: [route({
        path: '/notes',
        method: 'POST',
        name: 'n',
        handler: { module: NotesController, action: 'create' }
      })]
    })

    expect((await listing(handler))[0]).toMatchObject({ name: 'from-handler', description: 'Handler said so.' })
  })

  it('reads a validation declaration a handler made, not only one on the route', async () => {
    const { addMetadata, methodDecoratorLegacyWrapper } = await import('@stone-js/core')
    const { DECLARATION_KEYS } = await import('../src/constants')

    // `@Validate` in miniature, writing exactly what the real one writes, under the string key the
    // convention names. Reading it without importing the package is the whole point.
    const Validate = (schema: unknown): MethodDecorator =>
      methodDecoratorLegacyWrapper((_t: any, context: any) => {
        addMetadata(context, DECLARATION_KEYS.validation, { action: context.name, validation: schema })
      })

    class NotesController {
      @Validate(z.object({ title: z.string() }))
      create (): object { return {} }
    }

    const { handler } = handlerFor({
      routes: [route({
        path: '/notes',
        method: 'POST',
        name: 'n',
        mcp: { name: 'create', description: 'Create.' },
        handler: { module: NotesController, action: 'create' }
      })]
    })

    expect(Object.keys((await listing(handler))[0].inputSchema.properties)).toEqual(['title'])
  })
})
