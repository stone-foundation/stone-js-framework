import { Argv } from 'yargs'
import { IncomingEvent } from '@stone-js/core'
import { AppBuilder } from '../../src/create/AppBuilder'
import { InitCommand, initCommandOptions } from '../../src/commands/InitCommand'

vi.mock('../../src/create/AppBuilder', () => ({
  AppBuilder: vi.fn().mockImplementation(() => ({
    build: vi.fn()
  }))
}))

describe('InitCommand', () => {
  let context: any
  let event: IncomingEvent

  beforeEach(() => {
    vi.clearAllMocks()

    context = {
      commandOutput: {
        error: vi.fn()
      }
    }

    event = {
      type: 'cli',
      payload: {}
    } as unknown as IncomingEvent
  })

  it('should call AppBuilder.build successfully', async () => {
    const builder = vi.mocked(new AppBuilder(context))
    builder.build.mockResolvedValue(undefined)
    vi.mocked(AppBuilder).mockImplementation(() => builder)

    const cmd = new InitCommand(context)
    await cmd.handle(event)

    expect(AppBuilder).toHaveBeenCalledWith(context)
    expect(builder.build).toHaveBeenCalledWith(event)
    expect(context.commandOutput.error).not.toHaveBeenCalled()
  })

  it('should catch error and call commandOutput.error', async () => {
    const builder = vi.mocked(new AppBuilder(context))
    const err = new Error('boom!')
    builder.build.mockRejectedValue(err)
    vi.mocked(AppBuilder).mockImplementation(() => builder)

    const cmd = new InitCommand(context)
    await cmd.handle(event)

    expect(AppBuilder).toHaveBeenCalledWith(context)
    expect(builder.build).toHaveBeenCalledWith(event)
    expect(context.commandOutput.error).toHaveBeenCalledWith('boom!')
  })
})

describe('initCommandOptions', () => {
  it('should define correct CLI metadata', () => {
    expect(initCommandOptions.name).toBe('init')
    expect(initCommandOptions.alias).toBe('i')
    expect(initCommandOptions.args).toEqual(['[project-name]'])
    expect(initCommandOptions.desc).toBe('Create a fresh Stone app from a starter template')
  })

  it('should configure yargs options properly', () => {
    const mockYargs = {
      positional: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis()
    }

    const result = (initCommandOptions.options as ((args: Argv<any>) => Argv<any>))?.(mockYargs as any)

    expect(mockYargs.positional).toHaveBeenCalledWith('project-name', {
      type: 'string',
      desc: 'your project name'
    })

    expect(mockYargs.option).toHaveBeenCalledWith('yes', {
      alias: 'y',
      default: false,
      type: 'boolean',
      desc: 'create with default values'
    })

    expect(mockYargs.option).toHaveBeenCalledWith('force', {
      alias: 'f',
      type: 'boolean',
      desc: 'Force overriding'
    })

    expect(result).toBe(mockYargs)
  })
})
