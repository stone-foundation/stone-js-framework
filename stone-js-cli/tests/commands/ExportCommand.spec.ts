import { Argv } from 'yargs'
import { isReactApp } from '../../src/utils'
import { IncomingEvent } from '@stone-js/core'
import { ExportCommand, exportCommandOptions } from '../../src/commands/ExportCommand'

// Mocks
vi.mock('../../src/utils', async (mod) => {
  const actual: any = await mod()
  return {
    ...actual,
    isReactApp: vi.fn()
  }
})

const ReactBuilderExport = vi.fn()
const ServerBuilderExport = vi.fn()

vi.mock('../../src/react/ReactBuilder', () => ({
  ReactBuilder: class {
    export = ReactBuilderExport
  }
}))

vi.mock('../../src/server/ServerBuilder', () => ({
  ServerBuilder: class {
    export = ServerBuilderExport
  }
}))

describe('ExportCommand', () => {
  let context: any
  let event: IncomingEvent

  beforeEach(() => {
    vi.clearAllMocks()

    context = {
      blueprint: { meta: {} }
    }

    event = {
      type: 'cli',
      payload: { module: 'app' }
    } as unknown as IncomingEvent
  })

  it('should call ReactBuilder.export if isReactApp is true', async () => {
    vi.mocked(isReactApp).mockReturnValue(true)

    const command = new ExportCommand(context)
    await command.handle(event)

    expect(isReactApp).toHaveBeenCalledWith(context.blueprint, event)
    expect(ReactBuilderExport).toHaveBeenCalledWith(event)
    expect(ServerBuilderExport).not.toHaveBeenCalled()
  })

  it('should call ServerBuilder.export if isReactApp is false', async () => {
    vi.mocked(isReactApp).mockReturnValue(false)

    const command = new ExportCommand(context)
    await command.handle(event)

    expect(isReactApp).toHaveBeenCalledWith(context.blueprint, event)
    expect(ServerBuilderExport).toHaveBeenCalledWith(event)
    expect(ReactBuilderExport).not.toHaveBeenCalled()
  })
})

describe('exportCommandOptions', () => {
  it('should expose proper command metadata', () => {
    expect(exportCommandOptions.name).toBe('export')
    expect(exportCommandOptions.alias).toBe('e')
    expect(exportCommandOptions.args).toEqual(['[module]'])
    expect(exportCommandOptions.desc).toBe('Useful to export Stone.js or third party config/options')
  })

  it('should configure yargs positional module option', () => {
    const yargsMock = {
      positional: vi.fn().mockReturnThis()
    }

    const result = (exportCommandOptions.options as ((args: Argv<any>) => Argv<any>))?.(yargsMock as any)

    expect(yargsMock.positional).toHaveBeenCalledWith('module', {
      type: 'string',
      default: 'app',
      choices: ['app', 'console', 'rollup', 'vite'],
      desc: 'module or config name to export. e.g. app, console, rollup'
    })

    expect(result).toBe(yargsMock)
  })
})
