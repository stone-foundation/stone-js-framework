import { stoneMcpTools, createReportTools } from '../src/tools'

const tool = (name: string): any => stoneMcpTools.find((t) => t.name === name)

describe('stoneMcpTools', () => {
  it('stone_search returns matches', async () => {
    const result: any = await tool('stone_search').handler({ query: 'jose' })
    expect(result.some((r: any) => r.title.includes('auth'))).toBe(true)
  })

  it('stone_concept returns one concept, the list, or an error', async () => {
    expect((await tool('stone_concept').handler({ id: 'kernel' })).title).toBe('Kernel (Initialization)')
    expect(Array.isArray(await tool('stone_concept').handler({}))).toBe(true)
    expect((await tool('stone_concept').handler({ id: 'nope' })).error).toBeDefined()
  })

  it('stone_search defaults an empty query to no results', async () => {
    expect(await tool('stone_search').handler({})).toEqual([])
  })

  it('stone_modules / best_practices / gaps / brief return content', async () => {
    expect((await tool('stone_modules').handler({})).length).toBeGreaterThan(10)
    expect((await tool('stone_best_practices').handler({})).length).toBeGreaterThan(0)
    expect((await tool('stone_gaps').handler({})).length).toBeGreaterThan(0)
    expect(String(await tool('stone_brief').handler({}))).toContain('# Stone.js')
  })
})

describe('createReportTools', () => {
  const okFetch = vi.fn(async () => ({ ok: true, json: async () => ({ number: 42, html_url: 'https://gh/issues/42' }) })) as any
  const errFetch = vi.fn(async () => ({ ok: false, status: 403 })) as any

  it('opens a bug issue and returns its number/url', async () => {
    const tools = createReportTools({ token: 't', repo: 'stone-foundation/stone-js-framework', fetch: okFetch })
    const bug = tools.find((t) => t.name === 'stone_report_bug')
    const result: any = await bug?.handler({ title: 'Crash', body: 'stack' })
    expect(result).toEqual({ number: 42, url: 'https://gh/issues/42' })
    const [url, init] = okFetch.mock.calls[0]
    expect(url).toContain('/repos/stone-foundation/stone-js-framework/issues')
    expect(JSON.parse(init.body).labels).toEqual(['bug'])
  })

  it('opens a feature request with the enhancement label', async () => {
    const tools = createReportTools({ token: 't', repo: 'o/r', fetch: okFetch })
    const feature = tools.find((t) => t.name === 'stone_request_feature')
    await feature?.handler({ title: 'Add X' })
    expect(JSON.parse(okFetch.mock.calls.at(-1)[1].body).labels).toEqual(['enhancement'])
  })

  it('applies default title/body when none are given', async () => {
    const tools = createReportTools({ token: 't', repo: 'o/r', fetch: okFetch })

    await tools.find((t) => t.name === 'stone_report_bug')?.handler({})
    const bug = JSON.parse(okFetch.mock.calls.at(-1)[1].body)
    expect(bug.title).toBe('Bug report')
    expect(bug.body).toBe('')

    await tools.find((t) => t.name === 'stone_request_feature')?.handler({})
    expect(JSON.parse(okFetch.mock.calls.at(-1)[1].body).title).toBe('Feature request')
  })

  it('surfaces a GitHub API error', async () => {
    const tools = createReportTools({ token: 't', repo: 'o/r', fetch: errFetch })
    const result: any = await tools[0].handler({ title: 'x', body: 'y' })
    expect(result.error).toContain('403')
  })

  it('defaults the fetch implementation to the global', () => {
    const tools = createReportTools({ token: 't', repo: 'o/r' })
    expect(tools).toHaveLength(2)
  })
})
