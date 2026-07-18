import { Argv } from 'yargs'
import { isReactApp } from '../../src/utils'
import { IncomingEvent } from '@stone-js/core'
import { BuildCommand, buildCommandOptions } from '../../src/commands/BuildCommand'

const ReactBuilderBuild = vi.fn()
const ServerBuilderBuild = vi.fn()

vi.mock('../../src/react/ReactBuilder', () => ({
  ReactBuilder: class {
    build = ReactBuilderBuild
  }
}))

vi.mock('../../src/server/ServerBuilder', () => ({
  ServerBuilder: class {
    build = ServerBuilderBuild
  }
}))

vi.mock('../../src/utils', async (mod) => {
  const actual: any = await mod()
  return {
    ...actual,
    isReactApp: vi.fn()
  }
})

describe('BuildCommand', () => {
  let context: any
  let event: IncomingEvent

  beforeEach(() => {
    vi.clearAllMocks()
    context = { blueprint: { meta: {} } }
    event = { type: 'cli', payload: {} } as unknown as IncomingEvent
  })

  it('should call ReactBuilder if isReactApp returns true', async () => {
    vi.mocked(isReactApp).mockReturnValue(true)
    const command = new BuildCommand(context)
    await command.handle(event)

    expect(ServerBuilderBuild).not.toHaveBeenCalled()
    expect(ReactBuilderBuild).toHaveBeenCalledWith(event)
    expect(isReactApp).toHaveBeenCalledWith(context.blueprint, event)
  })

  it('should call ServerBuilder if isReactApp returns false', async () => {
    (isReactApp as any).mockReturnValue(false)
    const command = new BuildCommand(context)
    await command.handle(event)

    expect(ReactBuilderBuild).not.toHaveBeenCalled()
    expect(ServerBuilderBuild).toHaveBeenCalledWith(event)
    expect(isReactApp).toHaveBeenCalledWith(context.blueprint, event)
  })
})

describe('buildCommandOptions', () => {
  it('should have correct metadata', () => {
    expect(buildCommandOptions.name).toBe('build')
    expect(buildCommandOptions.alias).toBe('prod')
    expect(buildCommandOptions.args).toEqual(['[target]'])
    expect(buildCommandOptions.desc).toBe('Build project for production')
  })

  it('should configure yargs with all options', () => {
    const mockYargs: any = {
      positional: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis()
    }

    const result = (buildCommandOptions.options as ((args: Argv<any>) => Argv<any>))(mockYargs)

    expect(result).toBe(mockYargs)
    expect(mockYargs.positional).toHaveBeenCalledWith('target', expect.objectContaining({
      type: 'string',
      desc: 'app target to build',
      choices: ['server', 'react']
    }))

    const optionKeys = ['language', 'rendering', 'lazy', 'imperative']
    for (const key of optionKeys) {
      expect(mockYargs.option).toHaveBeenCalledWith(
        key,
        expect.objectContaining({ type: expect.any(String), desc: expect.any(String) })
      )
    }
  })
})
