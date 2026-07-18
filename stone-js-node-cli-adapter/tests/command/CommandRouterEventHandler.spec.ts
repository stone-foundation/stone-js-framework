import { COMMAND_NOT_FOUND_CODE } from '../../src/constants'
import { NodeCliAdapterError } from '../../src/errors/NodeCliAdapterError'
import { CommandRouterEventHandler } from '../../src/command/CommandRouterEventHandler'

/* eslint-disable @typescript-eslint/no-extraneous-class */

const createMockEvent = (task?: string): any => ({
  getMetadataValue: vi.fn().mockImplementation((key: string) => {
    if (key === '_task') return task
    return undefined
  })
})

const createMockCommand = (name: string, alias?: string | string[], match?: (e: any) => boolean, handleResult?: any): any => ({
  options: { name, alias },
  handle: vi.fn().mockResolvedValue(handleResult ?? `handled:${name}`),
  match
})

describe('CommandRouterEventHandler', () => {
  let container: any
  let blueprint: any
  let handler: CommandRouterEventHandler

  beforeEach(() => {
    container = {
      resolve: vi.fn()
    }

    blueprint = {
      get: vi.fn().mockReturnValue([])
    }

    handler = new CommandRouterEventHandler({ container, blueprint })
  })

  it('should be created with container and blueprint', () => {
    expect(CommandRouterEventHandler.create({ container, blueprint })).toBeInstanceOf(CommandRouterEventHandler)
  })

  it('should fallback to wildcard command if no match', async () => {
    const defaultCmd = createMockCommand('*', undefined, undefined, 'wildcard')
    blueprint.get.mockReturnValue([{ options: defaultCmd.options, module: defaultCmd.handle }])

    container.resolve.mockReturnValue(defaultCmd)

    const event = createMockEvent('unknown-task')
    const result = await handler.handle(event)

    expect(result).toBe('wildcard')
  })

  it('should match command by name', async () => {
    const cmd = createMockCommand('run', undefined)
    blueprint.get.mockReturnValue([{ options: cmd.options, module: cmd.handle }])

    container.resolve.mockReturnValue(cmd)

    const event = createMockEvent('run')
    const result = await handler.dispatch(event)

    expect(result).toBe('handled:run')
  })

  it('should match command by alias (string)', async () => {
    const cmd = createMockCommand('deploy', 'd')
    blueprint.get.mockReturnValue([{ options: cmd.options, module: cmd.handle }])
    container.resolve.mockReturnValue(cmd)

    const event = createMockEvent('d')
    const result = await handler.dispatch(event)

    expect(result).toBe('handled:deploy')
  })

  it('should match command by alias (array)', async () => {
    const cmd = createMockCommand('commit', ['c', 'ci'])
    blueprint.get.mockReturnValue([{ options: cmd.options, module: cmd.handle }])
    container.resolve.mockReturnValue(cmd)

    const event = createMockEvent('ci')
    const result = await handler.dispatch(event)

    expect(result).toBe('handled:commit')
  })

  it('should match using match() method if defined', async () => {
    const customMatcher = vi.fn().mockReturnValue(true)
    const cmd = createMockCommand('x', undefined, customMatcher)
    blueprint.get.mockReturnValue([{ options: cmd.options, module: () => cmd, isFactory: true }])
    container.resolve.mockReturnValue(cmd)

    const event = createMockEvent('irrelevant')
    const result = await handler.dispatch(event)

    expect(result).toBe('handled:x')
    expect(customMatcher).toHaveBeenCalledWith(event)
  })

  it('should return 404 if no command is found', async () => {
    blueprint.get.mockReturnValue([])

    const event = createMockEvent('notfound')
    const result: any = await handler.runCommand(event, undefined)

    expect(result.statusCode).toEqual(COMMAND_NOT_FOUND_CODE)
  })

  it('should throw error if resolved command has no handle', async () => {
    // @ts-expect-error - testing error case
    await expect(async () => await handler.runCommand({}, {})).rejects.toThrow(NodeCliAdapterError)
  })

  it('should resolve class command', () => {
    const meta = { options: { name: 'class' }, module: class {}, isClass: true }
    blueprint.get.mockReturnValue([meta])
    container.resolve.mockReturnValue({ handle: vi.fn() })

    // @ts-expect-error - testing private method
    const command = handler.resolveCommand(meta)
    expect(container.resolve).toHaveBeenCalledWith(meta.module, true)
    expect(typeof command.handle).toBe('function')
  })

  it('should resolve factory command', () => {
    const factoryFn = vi.fn().mockReturnValue(vi.fn())
    const meta = { options: { name: 'factory' }, module: factoryFn, isFactory: true }
    blueprint.get.mockReturnValue([meta])

    // @ts-expect-error - testing private method
    const command = handler.resolveCommand(meta)
    expect(factoryFn).toHaveBeenCalledWith(container)
    expect(typeof command.handle).toBe('function')
  })

  it('should resolve functional command', () => {
    const fn = vi.fn()
    const meta = { options: { name: 'fn' }, module: fn }
    blueprint.get.mockReturnValue([meta])

    const command = (handler as any).resolveCommand(meta)
    expect(command.handle).toBe(fn)
  })

  it('should throw if command could not be resolved', () => {
    const meta = { options: { name: 'invalid' }, module: {} }
    expect(() => (handler as any).resolveCommand(meta)).toThrow(NodeCliAdapterError)
  })
})
