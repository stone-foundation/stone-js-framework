import { moduleName, sanitize, createIntrospectionTools } from '../src/introspection'

class Handler {}
const tool = (tools: any[], name: string): any => tools.find((t) => t.name === name)

describe('moduleName', () => {
  it('names strings, functions, meta-modules, and falls back', () => {
    expect(moduleName('x')).toBe('x')
    expect(moduleName(Handler)).toBe('Handler')
    expect(moduleName({ module: Handler })).toBe('Handler')
    expect(moduleName({ name: 'Named' })).toBe('Named')
    expect(moduleName(undefined)).toBe('unknown')
    expect(moduleName(42)).toBe('unknown')
    expect(moduleName(() => {})).toBe('anonymous')
  })
})

describe('sanitize', () => {
  it('redacts secret-looking keys and labels functions/regexps', () => {
    const out: any = sanitize({ token: 'abc', nested: { password: 'p', ok: 1 }, fn: () => {}, re: /a/, list: [1, 2] })
    expect(out.token).toBe('[redacted]')
    expect(out.nested.password).toBe('[redacted]')
    expect(out.nested.ok).toBe(1)
    expect(out.fn).toContain('[Function:')
    expect(out.re).toBe('/a/')
    expect(out.list).toEqual([1, 2])
  })

  it('passes primitives and null through, caps depth', () => {
    expect(sanitize('s')).toBe('s')
    expect(sanitize(null)).toBe(null)
    expect(sanitize({ a: 1 }, 7)).toBe('[max-depth]')
  })
})

describe('createIntrospectionTools', () => {
  const blueprint: any = {
    get: (key: string, fb: unknown) => {
      const store: Record<string, unknown> = {
        'stone.name': 'demo',
        'stone.env': 'dev',
        'stone.adapter.platform': 'node_http',
        'stone.router.definitions': [
          { path: '/', name: 'home', methods: ['GET'], handler: Handler, middleware: [Handler], children: [{ path: '/x', method: 'POST' }] }
        ],
        'stone.adapter.commands': [{ options: { name: 'mcp', alias: 'm', desc: 'x' } }],
        'stone.adapters': [{ platform: 'node_http', default: true }],
        'stone.providers': [Handler],
        'stone.kernel': { eventHandler: Handler, middleware: [Handler], errorHandlers: { RouterError: {} } },
        'stone.keyRouting.definitions': [{ key: 'user.created', module: Handler }],
        stone: { name: 'demo', secretKey: 'shh' }
      }
      return key in store ? store[key] : fb
    }
  }
  const tools = createIntrospectionTools(blueprint)

  it('stone_app summarizes name/env/platform and counts', () => {
    const r: any = tool(tools, 'stone_app').handler({})
    expect(r.name).toBe('demo')
    expect(r.platform).toBe('node_http')
    expect(r.counts.routes).toBe(2)
    expect(r.counts.commands).toBe(1)
  })

  it('stone_routes maps the tree with handler + middleware names', () => {
    const r: any = tool(tools, 'stone_routes').handler({})
    expect(r[0].handler).toBe('Handler')
    expect(r[0].middleware).toEqual(['Handler'])
    expect(r[0].children[0].path).toBe('/x')
  })

  it('stone_commands / adapters / providers / kernel / key_routes', () => {
    expect(tool(tools, 'stone_commands').handler({})[0].name).toBe('mcp')
    expect(tool(tools, 'stone_adapters').handler({}).active).toBe('node_http')
    expect(tool(tools, 'stone_providers').handler({})).toEqual(['Handler'])
    const k: any = tool(tools, 'stone_kernel').handler({})
    expect(k.eventHandler).toBe('Handler')
    expect(k.errorHandlers).toEqual(['RouterError'])
    expect(tool(tools, 'stone_key_routes').handler({})[0].key).toBe('user.created')
  })

  it('stone_config lists top-level keys, reads a key, and redacts secrets', () => {
    expect(tool(tools, 'stone_config').handler({})).toContain('name')
    expect(tool(tools, 'stone_config').handler({ key: 'stone.name' })).toBe('demo')
    expect((tool(tools, 'stone_config').handler({ key: 'stone' }) as any).secretKey).toBe('[redacted]')
  })
})
