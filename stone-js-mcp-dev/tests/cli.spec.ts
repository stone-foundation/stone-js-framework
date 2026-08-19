import { DEV_COMMANDS, GENERATED_MODULE, generatedModule, mcpDevCliPlugin } from '../src/cli'

const makeContext = (command: string): any => ({
  command,
  blueprint: { get: (_key: string, fallback: unknown) => fallback },
  writeFile: vi.fn((path: string) => `/base/.stone/tmp/${path}`),
  addModule: vi.fn(),
  addBlueprint: vi.fn()
})

describe('the MCP dev CLI plugin', () => {
  it('names itself, so a developer sees what participated in the build', () => {
    expect(mcpDevCliPlugin()).toEqual(expect.objectContaining({ name: '@stone-js/mcp-dev' }))
  })

  it('injects the publisher while a developer is working', async () => {
    // Introspection is a development concern, so the build decides it: the application never mentions
    // this module, and never depends on it.
    for (const command of DEV_COMMANDS) {
      const context = makeContext(command)

      await mcpDevCliPlugin().onPrepare?.(context)

      expect(context.writeFile).toHaveBeenCalledWith(GENERATED_MODULE, expect.stringContaining('publishAppContext'))
      expect(context.addModule).toHaveBeenCalledWith(`./${GENERATED_MODULE}`)
    }
  })

  it('injects nothing into a production build', async () => {
    // The one property that matters most: a shipped artifact carries none of this.
    const context = makeContext('build')

    await mcpDevCliPlugin().onPrepare?.(context)

    expect(context.writeFile).not.toHaveBeenCalled()
    expect(context.addModule).not.toHaveBeenCalled()
  })

  it('injects a hook that publishes, and restates nothing', () => {
    // The redaction rules and the file format stay in the package; the generated module only wires
    // them into the app that is running.
    const source = generatedModule()

    expect(source).toContain("import { publishAppContext } from '@stone-js/mcp-dev'")
    expect(source).toContain('onStart:')
    expect(source).toContain('export const mcpDevContextBlueprint')
  })
})

describe('turning it off', () => {
  it('injects nothing when the project opts out', async () => {
    // Presence is a build decision, so opting out means nothing is generated at all — not code that
    // ships and then decides not to run.
    const context = makeContext('dev')
    context.blueprint = { get: (_key: string, _fallback: unknown) => false }

    await mcpDevCliPlugin().onPrepare?.(context)

    expect(context.writeFile).not.toHaveBeenCalled()
  })
})
