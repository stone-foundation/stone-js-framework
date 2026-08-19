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

  it('does not hand out the shared blueprint, nor mutate it', () => {
    // It used to merge the options INTO the exported constant and hand that very object to every
    // decorated class, so a second application inherited the first one's options and the constant
    // stayed dirty for the rest of the process. Every other adapter decorator clones first.
    vi.mocked(addBlueprint).mockImplementation(() => {})

    // The mocked wrapper invokes the decorator body itself, so each decoration reaches addBlueprint
    // more than once; clearing between the two keeps each application's blueprint identifiable.
    vi.mocked(addBlueprint).mockClear()
    NodeConsole({ alias: 'first' })(class {})
    const first = vi.mocked(addBlueprint).mock.calls.at(-1)?.[2] as any

    vi.mocked(addBlueprint).mockClear()
    NodeConsole()(class {})
    const second = vi.mocked(addBlueprint).mock.calls.at(-1)?.[2] as any

    expect(first).not.toBe(nodeConsoleAdapterBlueprint)
    expect(first.stone.adapters[0].alias).toBe('first')
    expect(second.stone.adapters[0].alias).not.toBe('first')
    expect(nodeConsoleAdapterBlueprint.stone.adapters?.[0]).not.toHaveProperty('alias', 'first')
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
