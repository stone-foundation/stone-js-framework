import { McpDev } from '../src/browser/decorators/McpDev'
import { mcpDevBlueprint, defineMcpDev } from '../src/browser/options/McpDevBlueprint'

vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    classDecoratorLegacyWrapper: (fn: Function) => { fn(class {}, {}); return fn }
  }
})

describe('browser stubs', () => {
  it('McpDev is a no-op decorator (with or without options)', () => {
    expect(() => McpDev({ name: 'x' })(class {})).not.toThrow()
    expect(() => McpDev()(class {})).not.toThrow()
  })

  it('mcpDevBlueprint is inert: config bucket, no wired middleware', () => {
    expect(mcpDevBlueprint.stone.mcpDev).toEqual({})
    expect(mcpDevBlueprint.stone.blueprint).toBeUndefined()
  })

  it('defineMcpDev returns the options with no Node wiring', () => {
    expect(defineMcpDev({ name: 'y' }).stone.mcpDev).toEqual({ name: 'y' })
    expect(defineMcpDev().stone.mcpDev).toEqual({})
  })
})
