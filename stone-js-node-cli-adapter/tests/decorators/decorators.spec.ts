import { COMMAND_KEY } from '../../src/decorators/constants'
import { Command, CommandOptions } from '../../src/decorators/Command'
import { NodeConsoleOptions, NodeConsole } from '../../src/decorators/NodeConsole'
import { nodeConsoleAdapterBlueprint } from '../../src/options/NodeConsoleAdapterBlueprint'
import { NodeConsole as BrowserNodeConsole } from '../../src/browser/decorators/NodeConsole'
import { addBlueprint, classDecoratorLegacyWrapper, setClassMetadata } from '@stone-js/core'
import { nodeConsoleAdapterBlueprint as baseNodeConsoleAdapterBlueprint } from '../../src/browser/options/NodeConsoleAdapterBlueprint'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mock setClassMetadata
vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    setClassMetadata: vi.fn(() => {}),
    classDecoratorLegacyWrapper: vi.fn((fn: Function) => {
      fn()
      return fn
    })
  }
})

describe('NodeConsole', () => {
  it('should call addBlueprint with correct parameters', () => {
    const options: NodeConsoleOptions = nodeConsoleAdapterBlueprint.stone.adapters?.[0] ?? {}
    NodeConsole(options)(class {})
    BrowserNodeConsole()(class {})
    expect(addBlueprint).toHaveBeenCalled()
    expect(classDecoratorLegacyWrapper).toHaveBeenCalledTimes(2)
    expect(addBlueprint).not.toHaveBeenCalledWith(expect.any(Function), expect.any(Object), baseNodeConsoleAdapterBlueprint)
  })

  it('should call addBlueprint with default options if none are provided', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    NodeConsole()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})

describe('Command', () => {
  it('should call setClassMetadata with correct parameters', () => {
    const options: CommandOptions = { name: 'test', args: '<file>' }
    Command(options)
    expect(setClassMetadata).toHaveBeenCalledWith(COMMAND_KEY, { options, isClass: true })
  })

  it('should call setClassMetadata with default options if none are provided', () => {
    Command()
    expect(setClassMetadata).toHaveBeenCalledWith(COMMAND_KEY, { options: {}, isClass: true })
  })
})
