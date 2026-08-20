import { Argv } from 'yargs'
import { BuildCommand, buildCommandOptions } from '../../src/commands/BuildCommand'
import { makeContext, makeEvent } from './builderTestHelpers'

describe('BuildCommand', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('drives the target that matched, and only that one', async () => {
    const react = vi.fn()
    const server = vi.fn()
    const context = makeContext({
      react: { target: 'react', priority: 10, match: () => true, resolver: () => ({ build: react }) },
      server: { target: 'server', priority: 100, match: () => true, resolver: () => ({ build: server }) }
    })
    const event = makeEvent()

    await new BuildCommand(context).handle(event)

    expect(react).toHaveBeenCalledWith(event)
    expect(server).not.toHaveBeenCalled()
  })

  it('falls through to the target that answers anything', async () => {
    const react = vi.fn()
    const server = vi.fn()
    const context = makeContext({
      react: { target: 'react', priority: 10, match: () => false, resolver: () => ({ build: react }) },
      server: { target: 'server', priority: 100, match: () => true, resolver: () => ({ build: server }) }
    })
    const event = makeEvent()

    await new BuildCommand(context).handle(event)

    expect(server).toHaveBeenCalledWith(event)
    expect(react).not.toHaveBeenCalled()
  })

  it('lets --target override what detection would have chosen', async () => {
    const react = vi.fn()
    const server = vi.fn()
    const context = makeContext({
      react: { target: 'react', priority: 10, match: () => true, resolver: () => ({ build: react }) },
      server: { target: 'server', priority: 100, match: () => true, resolver: () => ({ build: server }) }
    })

    await new BuildCommand(context).handle(makeEvent({ target: 'server' }))

    expect(server).toHaveBeenCalled()
    expect(react).not.toHaveBeenCalled()
  })

  it('honours a configured target when the command line names none', async () => {
    const server = vi.fn()
    const context = makeContext(
      {
        react: { target: 'react', priority: 10, match: () => true, resolver: () => ({ build: vi.fn() }) },
        server: { target: 'server', priority: 100, match: () => true, resolver: () => ({ build: server }) }
      },
      { 'stone.builder.target': 'server' }
    )

    await new BuildCommand(context).handle(makeEvent())

    expect(server).toHaveBeenCalled()
  })

  it('names the registered targets when asked for one that does not exist', async () => {
    const context = makeContext({
      react: { target: 'react', match: () => true, resolver: () => ({ build: vi.fn() }) }
    })

    await expect(new BuildCommand(context).handle(makeEvent({ target: 'wat' })))
      .rejects.toThrow(/Unknown build target "wat".*react/s)
  })

  it('says so when a target cannot build', async () => {
    const context = makeContext({
      native: { target: 'native', match: () => true, resolver: () => ({}) }
    })

    await expect(new BuildCommand(context).handle(makeEvent()))
      .rejects.toThrow(/"build" step is not supported/)
  })
})

describe('buildCommandOptions', () => {
  it('should have correct metadata', () => {
    expect(buildCommandOptions.name).toBe('build')
    expect(buildCommandOptions.alias).toBe('prod')
    expect(buildCommandOptions.args).toEqual(['[target]'])
    expect(buildCommandOptions.desc).toBe('Build project for production')
  })

  it('accepts any registered target rather than a closed list', () => {
    const mockYargs: any = {
      positional: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis()
    }

    const result = (buildCommandOptions.options as ((args: Argv<any>) => Argv<any>))(mockYargs)

    expect(result).toBe(mockYargs)
    // No `choices`: the CLI cannot know at option-parsing time which targets a project
    // registered, and an unknown one is rejected by the resolver, which can name the real list.
    expect(mockYargs.positional).toHaveBeenCalledWith('target', expect.objectContaining({ type: 'string' }))
    expect(mockYargs.positional.mock.calls[0][1]).not.toHaveProperty('choices')

    for (const key of ['language', 'rendering', 'lazy', 'imperative']) {
      expect(mockYargs.option).toHaveBeenCalledWith(
        key,
        expect.objectContaining({ type: expect.any(String), desc: expect.any(String) })
      )
    }
  })
})
