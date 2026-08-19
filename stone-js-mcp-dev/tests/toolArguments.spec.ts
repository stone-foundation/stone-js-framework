import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createIntrospectionTools } from '../src/introspection'
import { buildMcpServer, resolveTools } from '../src/McpDevServer'
import { createReportTools, stoneMcpTools } from '../src/tools'

/**
 * These tests speak the real protocol rather than calling handlers directly, because that is where
 * the defect lived: every handler was correct, and every one of them received `{}` because the
 * schema advertised to the client declared no arguments, so the client dropped them before sending.
 * Calling a handler in-process cannot see that, and would have passed throughout.
 */
const connect = async (tools: any[] = []): Promise<Client> => {
  const server = buildMcpServer({ tools, quiet: true }, () => {})
  const client = new Client({ name: 'test', version: '0' })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])

  return client
}

/** The text an MCP tool result carries, which is where these tools put their payload. */
const textOf = (result: any): string => result.content.map((part: any) => part.text).join('')

describe('published tool arguments', () => {
  it('advertises the arguments each tool reads, so the client sends them', async () => {
    const client = await connect()

    const tools = (await client.listTools()).tools
    const schemaOf = (name: string): any => tools.find((tool) => tool.name === name)?.inputSchema

    expect(schemaOf('stone_search')?.properties).toHaveProperty('query')
    expect(schemaOf('stone_search')?.required).toContain('query')

    // `id` is genuinely optional: omitting it lists every concept. That was always the intent, it
    // simply had to be expressed in the schema instead of being the only reachable branch.
    expect(schemaOf('stone_concept')?.properties).toHaveProperty('id')
    expect(schemaOf('stone_concept')?.required ?? []).not.toContain('id')

    await client.close()
  })

  it('search returns matches instead of an empty list', async () => {
    // The most misleading symptom: an empty array and no error, which made a fully populated
    // knowledge base look empty.
    const client = await connect()

    const result = await client.callTool({ name: 'stone_search', arguments: { query: 'blueprint' } })

    expect(JSON.parse(textOf(result))).not.toHaveLength(0)
    expect(textOf(result).toLowerCase()).toContain('blueprint')

    await client.close()
  })

  it('a concept id returns that concept, and omitting it still lists them all', async () => {
    const client = await connect()

    const one = JSON.parse(textOf(await client.callTool({ name: 'stone_concept', arguments: { id: 'continuum' } })))
    const all = JSON.parse(textOf(await client.callTool({ name: 'stone_concept', arguments: {} })))

    expect(one).toMatchObject({ id: 'continuum', title: 'Continuum Architecture' })
    expect(all.length).toBeGreaterThan(1)

    await client.close()
  })

  it('reads a config key, and still redacts what looks secret', async () => {
    const blueprint: any = {
      get: (key: string, fallback?: unknown) => ({
        stone: { router: { x: 1 }, secretToken: 'do-not-leak' },
        'stone.router': { x: 1 },
        'stone.secretToken': 'do-not-leak'
      })[key] ?? fallback
    }
    const client = await connect(createIntrospectionTools(blueprint))

    const value = await client.callTool({ name: 'stone_config', arguments: { key: 'stone.router' } })
    const keys = await client.callTool({ name: 'stone_config', arguments: {} })

    expect(JSON.parse(textOf(value))).toEqual({ x: 1 })
    expect(JSON.parse(textOf(keys))).toEqual(['router', 'secretToken'])

    await client.close()
  })

  it('the report tools receive their title and body', async () => {
    const calls: any[] = []
    const fakeFetch: any = async (_url: string, init: any) => {
      calls.push(JSON.parse(init.body))
      return { ok: true, json: async () => ({ number: 7, html_url: 'https://example.test/7' }) }
    }
    const client = await connect(createReportTools({ token: 't', repo: 'o/r', fetch: fakeFetch }))

    await client.callTool({
      name: 'stone_report_bug',
      arguments: { title: 'It breaks', body: 'Steps to reproduce…' }
    })

    expect(calls[0]).toMatchObject({ title: 'It breaks', body: 'Steps to reproduce…', labels: ['bug'] })

    await client.close()
  })

  it('every tool that reads arguments declares them', () => {
    // The guard that outlives this fix: a handler taking a parameter but publishing no schema is
    // the exact shape of the bug, and it is detectable without anyone remembering to look.
    const tools = [
      ...resolveTools({ report: { token: 't', repo: 'o/r' } }),
      ...createIntrospectionTools({ get: (_k: string, fallback?: unknown) => fallback } as any)
    ]

    const undeclared = tools
      .filter((tool) => tool.handler.length > 0 && tool.inputSchema === undefined)
      .map((tool) => tool.name)

    expect(undeclared).toEqual([])
    // Guard the guard: the check is only meaningful if some tools do read arguments.
    expect(tools.filter((tool) => tool.handler.length > 0).length).toBeGreaterThan(0)
    expect(stoneMcpTools.length).toBeGreaterThan(0)
  })
})
