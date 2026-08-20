import { Argv } from 'yargs'
import { IncomingEvent } from '@stone-js/core'
import { ExportCommand, exportCommandOptions } from '../../src/commands/ExportCommand'
import { makeContext, makeEvent } from './builderTestHelpers'


describe('ExportCommand', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('asks the target that matched to export', async () => {
    const exportStep = vi.fn()
    const context = makeContext({
      react: { target: 'react', priority: 10, match: () => true, resolver: () => ({ export: exportStep }) },
      server: { target: 'server', priority: 100, match: () => true, resolver: () => ({ export: vi.fn() }) }
    })
    const event = makeEvent({ module: 'app' })

    await new ExportCommand(context).handle(event)

    expect(exportStep).toHaveBeenCalledWith(event)
  })

  it('asks the fallback target when nothing else matched', async () => {
    const exportStep = vi.fn()
    const context = makeContext({
      react: { target: 'react', priority: 10, match: () => false, resolver: () => ({ export: vi.fn() }) },
      server: { target: 'server', priority: 100, match: () => true, resolver: () => ({ export: exportStep }) }
    })
    const event = makeEvent({ module: 'app' })

    await new ExportCommand(context).handle(event)

    expect(exportStep).toHaveBeenCalledWith(event)
  })

  it('says so when a target has nothing to export', async () => {
    const context = makeContext({
      native: { target: 'native', match: () => true, resolver: () => ({}) }
    })

    await expect(new ExportCommand(context).handle(makeEvent()))
      .rejects.toThrow(/"export" step is not supported/)
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
