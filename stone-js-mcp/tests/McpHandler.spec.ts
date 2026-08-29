import { McpHandler } from '../src/McpHandler'
import { IncomingHttpEvent } from '@stone-js/http-core'
import { JSONRPC_VERSION, LATEST_PROTOCOL_VERSION } from '../src/constants'

/** A route, as the router hands one out. */
const route = (options: Record<string, unknown>): any => ({
  path: options.path,
  method: options.method ?? 'GET',
  getOption: <T>(key: string, fallback?: T) => (options[key] as T) ?? fallback
})

/** A handler wired to a router that holds these routes, recording what it is asked to dispatch. */
const handlerFor = (routes: any[], dispatch?: (event: any) => Promise<unknown>): {
  handler: McpHandler
  dispatched: any[]
  warnings: any[]
} => {
  const dispatched: any[] = []
  const warnings: any[] = []

  const router = {
    getRoutes: () => ({ getRoutes: () => routes }),
    dispatch: async (event: any) => {
      dispatched.push(event)
      return await (dispatch?.(event) ?? Promise.resolve({ content: { ok: true } }))
    }
  }

  const bound: Record<string, unknown> = {
    router,
    logger: { warn: (...args: any[]) => warnings.push(args), debug: () => {}, error: () => {} }
  }

  const handler = new McpHandler({
    blueprint: { get: (key: string, fallback?: unknown) => (key === 'stone.mcp' ? {} : fallback) } as any,
    container: {
      has: (key: unknown) => typeof key === 'string' && key in bound,
      make: (key: unknown) => bound[key as string]
    } as any
  })

  return { handler, dispatched, warnings }
}

/** One JSON-RPC message, on a real HTTP event. */
const request = (body: unknown, headers: Record<string, string> = {}): any =>
  IncomingHttpEvent.create({
    url: new URL('http://api.test/mcp'),
    method: 'POST',
    source: { rawEvent: {}, platform: 'test' } as any,
    ip: '1.2.3.4',
    headers,
    body: body as any
  })

const answer = async (handler: McpHandler, body: unknown, headers?: Record<string, string>): Promise<any> => {
  const response: any = await handler.handle(request(body, headers))
  return response.content
}

describe('the handshake', () => {
  it('speaks the revision the client asked for, when it knows it', async () => {
    const { handler } = handlerFor([])

    const result = await answer(handler, {
      jsonrpc: JSONRPC_VERSION,
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-03-26' }
    })

    expect(result).toMatchObject({ jsonrpc: '2.0', id: 1 })
    expect(result.result.protocolVersion).toBe('2025-03-26')
    expect(result.result.capabilities).toEqual({ tools: { listChanged: false } })
  })

  it('offers its own newest when the client asks for one it does not know', async () => {
    // Answering a revision nobody asked for without saying so is how two conformant halves end up
    // disagreeing about the shape of a message. The client sees the difference and decides.
    const { handler } = handlerFor([])

    const result = await answer(handler, { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '1999-01-01' } })

    expect(result.result.protocolVersion).toBe(LATEST_PROTOCOL_VERSION)
  })

  it('answers a ping, which is how a client checks the connection it does not hold', async () => {
    const { handler } = handlerFor([])

    expect(await answer(handler, { jsonrpc: '2.0', id: 7, method: 'ping' })).toEqual({
      jsonrpc: '2.0', id: 7, result: {}
    })
  })

  it('acknowledges a notification without answering it', async () => {
    // A message with no id expects no reply. Answering one anyway leaves a client waiting for a
    // correlation that never comes.
    const { handler } = handlerFor([])

    const response: any = await handler.handle(request({ jsonrpc: '2.0', method: 'notifications/initialized' }))

    expect(response.statusCode).toBe(202)
    expect(response.content).toBeUndefined()
  })

  it('refuses a method it does not have, by name', async () => {
    const { handler } = handlerFor([])

    const result = await answer(handler, { jsonrpc: '2.0', id: 2, method: 'resources/list' })

    expect(result.error).toMatchObject({ code: -32601 })
    expect(result.error.message).toContain('resources/list')
  })
})

describe('listing what an agent may call', () => {
  it('lists a route that said it is a tool, and no other', async () => {
    const { handler } = handlerFor([
      route({ path: '/notes', method: 'GET', name: 'notes.list', mcp: { name: 'list-notes', description: 'List notes.' } }),
      route({ path: '/health', method: 'GET', name: 'health' })
    ])

    const result = await answer(handler, { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.result.tools).toHaveLength(1)
    expect(result.result.tools[0]).toMatchObject({ name: 'list-notes', description: 'List notes.' })
  })

  it('takes the short form as the tool name', async () => {
    const { handler } = handlerFor([
      route({ path: '/notes', method: 'POST', name: 'notes.create', mcp: 'create-note', contract: { summary: 'Create a note.' } })
    ])

    const result = await answer(handler, { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.result.tools[0]).toMatchObject({ name: 'create-note', description: 'Create a note.' })
  })

  it('describes a tool from what the route already documented', async () => {
    // The route wrote a summary for a human reader. A model is a reader, so it is not written twice.
    const { handler } = handlerFor([
      route({ path: '/notes/:id', method: 'GET', name: 'notes.show', mcp: 'get-note', contract: { description: 'Read one note.' } })
    ])

    const result = await answer(handler, { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.result.tools[0].description).toBe('Read one note.')
  })

  it('takes the arguments from the path when nothing richer is declared', async () => {
    // What every route has, whatever else it does not. An application with no validation layer still
    // gets a usable tool.
    const { handler } = handlerFor([
      route({ path: '/orgs/:orgCode/notes/:id?', method: 'GET', name: 'notes.show', mcp: 'get-note' })
    ])

    const result = await answer(handler, { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.result.tools[0].inputSchema).toEqual({
      type: 'object',
      properties: {
        orgCode: { type: 'string', description: 'The orgCode in the path.' },
        id: { type: 'string', description: 'The id in the path.' }
      },
      required: ['orgCode']
    })
  })

  it('says out loud when a tool has no description', async () => {
    // An agent reading a bare name will guess what it does, and it guesses worst on the routes that
    // write. The tool is still exposed, because the route explicitly asked to be one.
    const { handler, warnings } = handlerFor([
      route({ path: '/notes', method: 'POST', name: 'notes.create', mcp: 'create-note' })
    ])

    const result = await answer(handler, { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.result.tools).toHaveLength(1)
    expect(warnings.some(([m]) => String(m).includes('has no description'))).toBe(true)
  })

  it('skips a route that asked to be a tool but has no name to be called by', async () => {
    const { handler, warnings } = handlerFor([route({ path: '/notes', method: 'GET', mcp: true })])

    const result = await answer(handler, { jsonrpc: '2.0', id: 1, method: 'tools/list' })

    expect(result.result.tools).toHaveLength(0)
    expect(warnings.some(([m]) => String(m).includes('no name'))).toBe(true)
  })
})

describe('calling a tool', () => {
  it('dispatches a real request to the route behind it', async () => {
    // The whole security model, and it is deliberately not a model: the call goes through the
    // router, so the route's own chain runs. A module that called the handler directly would turn
    // every annotated route into a way around its own guard.
    const { handler, dispatched } = handlerFor([
      route({ path: '/notes', method: 'POST', name: 'notes.create', mcp: { name: 'create-note', description: 'Create.' } })
    ])

    await answer(handler, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'create-note', arguments: { title: 'Thursday' } }
    })

    expect(dispatched).toHaveLength(1)
    expect(dispatched[0].method).toBe('POST')
    expect(dispatched[0].pathname).toBe('/notes')
    expect(dispatched[0].getBody()).toEqual({ title: 'Thursday' })
  })

  it('carries the caller credentials, because an agent acts for someone', async () => {
    const { handler, dispatched } = handlerFor([
      route({ path: '/notes', method: 'POST', name: 'notes.create', mcp: { name: 'create-note', description: 'Create.' } })
    ])

    await answer(
      handler,
      { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'create-note', arguments: {} } },
      { authorization: 'Bearer token-of-the-signed-in-user' }
    )

    expect(dispatched[0].getHeader('authorization')).toBe('Bearer token-of-the-signed-in-user')
  })

  it('fills the path from the arguments, and sends the rest where the route looks', async () => {
    const { handler, dispatched } = handlerFor([
      route({ path: '/orgs/:orgCode/notes', method: 'GET', name: 'notes.list', mcp: { name: 'list-notes', description: 'List.' } })
    ])

    await answer(handler, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'list-notes', arguments: { orgCode: 'acme', limit: 10 } }
    })

    expect(dispatched[0].pathname).toBe('/orgs/acme/notes')
    expect(dispatched[0].get('limit')).toBe('10')
  })

  it('escapes an argument going into the path', async () => {
    const { handler, dispatched } = handlerFor([
      route({ path: '/notes/:id', method: 'GET', name: 'notes.show', mcp: { name: 'get-note', description: 'Read.' } })
    ])

    await answer(handler, {
      jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'get-note', arguments: { id: 'a b/c' } }
    })

    expect(dispatched[0].pathname).toBe('/notes/a%20b%2Fc')
  })

  it('answers what the route answered, as text an agent can read', async () => {
    const { handler } = handlerFor(
      [route({ path: '/notes', method: 'POST', name: 'notes.create', mcp: { name: 'create-note', description: 'Create.' } })],
      async () => ({ content: { id: 42, title: 'Thursday' } })
    )

    const result = await answer(handler, {
      jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'create-note', arguments: {} }
    })

    expect(result.result.content).toEqual([{ type: 'text', text: '{"id":42,"title":"Thursday"}' }])
    expect(result.result.structuredContent).toBeUndefined()
  })

  it('adds a structured result only when the tool promised a shape', async () => {
    // Sending a structured result nobody was told to expect is how a client ends up validating
    // against a schema that does not exist.
    const { handler } = handlerFor(
      [route({
        path: '/notes',
        method: 'POST',
        name: 'notes.create',
        mcp: { name: 'create-note', description: 'Create.', outputSchema: { type: 'object' } }
      })],
      async () => ({ content: { id: 42 } })
    )

    const result = await answer(handler, {
      jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'create-note', arguments: {} }
    })

    expect(result.result.structuredContent).toEqual({ id: 42 })
  })

  it('reports a refused call as a result, not as a broken exchange', async () => {
    // An agent reads a failed result, explains it and tries something else. A JSON-RPC error would
    // end the exchange over something recoverable, and a refused authorization is exactly that.
    const { handler } = handlerFor(
      [route({ path: '/notes', method: 'POST', name: 'notes.create', mcp: { name: 'create-note', description: 'Create.' } })],
      async () => { throw new Error('This action is not allowed.') }
    )

    const result = await answer(handler, {
      jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'create-note', arguments: {} }
    })

    expect(result.error).toBeUndefined()
    expect(result.result).toMatchObject({ isError: true })
    expect(result.result.content[0].text).toBe('This action is not allowed.')
  })

  it('refuses a tool that is not on the list it handed out', async () => {
    const { handler } = handlerFor([])

    const result = await answer(handler, {
      jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'ghost', arguments: {} }
    })

    expect(result.error).toMatchObject({ code: -32602 })
    expect(result.error.message).toContain('ghost')
  })

  it('refuses a call that names no tool, or arguments that are not an object', async () => {
    const { handler } = handlerFor([])

    const noName = await answer(handler, { jsonrpc: '2.0', id: 1, method: 'tools/call', params: {} })
    const badArgs = await answer(handler, {
      jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'x', arguments: ['nope'] }
    })

    expect(noName.error).toMatchObject({ code: -32602 })
    expect(badArgs.error).toMatchObject({ code: -32602 })
  })
})

describe('a batch of messages', () => {
  it('answers each one, in order', async () => {
    const { handler } = handlerFor([])

    const result = await answer(handler, [
      { jsonrpc: '2.0', id: 1, method: 'ping' },
      { jsonrpc: '2.0', id: 2, method: 'ping' }
    ])

    expect(result.map((r: any) => r.id)).toEqual([1, 2])
  })

  it('acknowledges a batch of notifications without a body', async () => {
    const { handler } = handlerFor([])

    const response: any = await handler.handle(request([{ jsonrpc: '2.0', method: 'notifications/initialized' }]))

    expect(response.statusCode).toBe(202)
  })
})
