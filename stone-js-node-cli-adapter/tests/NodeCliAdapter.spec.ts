import yargs, { Argv } from 'yargs'
import { NodeCliAdapter } from '../src/NodeCliAdapter'
import { COMMAND_NOT_FOUND_CODE } from '../src/constants'
import { RawResponseWrapper } from '../src/RawResponseWrapper'
import { AdapterEventBuilder, IBlueprint } from '@stone-js/core'
import { NodeCliAdapterError } from '../src/errors/NodeCliAdapterError'

vi.mock('node:process')

const mockBuilderFn = (): Argv => ({
  help: vi.fn().mockReturnThis(),
  version: vi.fn().mockReturnThis(),
  showHelp: vi.fn().mockReturnThis(),
  scriptName: vi.fn().mockReturnThis(),
  parse: vi.fn().mockResolvedValue({ foo: 'bar', _: ['extra'], $0: 'script' }),
  command: vi.fn()
} as any)

vi.mock('yargs', () => ({
  default: vi.fn(() => mockBuilderFn())
}))

vi.mock('yargs/helpers', () => ({
  hideBin: vi.fn(() => [])
}))

vi.mock('../package.json', () => ({
  version: '1.0.0'
}))

// Mocks
const mockBlueprint = (): any => ({
  get: vi.fn().mockReturnValue([]),
  set: vi.fn()
} as any)

const createAdapter = (): { adapter: NodeCliAdapter, blueprint: IBlueprint } => {
  const blueprint = mockBlueprint()
  const adapter = NodeCliAdapter.create(blueprint)
  vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(async (e: any) => e)
  vi.spyOn(adapter as any, 'executeHooks').mockResolvedValue(undefined)
  vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)
  vi.spyOn(adapter as any, 'sendEventThroughDestination').mockImplementation(async (_, handler: any) => handler('ok'))
  vi.spyOn(adapter as any, 'handleError').mockResolvedValue(() => RawResponseWrapper.create({ body: 'error' }))
  return { adapter, blueprint }
}

describe('NodeCliAdapter', () => {
  let mockBuilder: any

  beforeEach(() => {
    mockBuilder = mockBuilderFn()
    vi.stubGlobal('window', undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('should create instance with blueprint', () => {
    const blueprint = mockBlueprint()
    const adapter = NodeCliAdapter.create(blueprint)
    expect(adapter).toBeInstanceOf(NodeCliAdapter)
  })

  it('must throw error if run in browser (onStart)', async () => {
    const { adapter } = createAdapter()
    // simulate browser
    vi.stubGlobal('window', {})
    // @ts-expect-error: private method
    await expect(adapter.onStart()).rejects.toThrow(NodeCliAdapterError)
    vi.unstubAllGlobals()
  })

  it('should not throw if onStart in node', async () => {
    const { adapter } = createAdapter()
    // @ts-expect-error: private method
    await expect(adapter.onStart()).resolves.toBeUndefined()
  })

  it('should registerAppCommands into yargs', () => {
    const { adapter, blueprint } = createAdapter()
    const spy = vi.spyOn(adapter as any, 'registerCommand')

    const cmd = { options: { name: 'cmd', args: ['<arg>'], alias: ['c'], desc: 'desc', options: vi.fn() } }
    // @ts-expect-error - testing purpose
    blueprint.get.mockReturnValue([cmd])

    // @ts-expect-error: private method
    adapter.registerAppCommands(mockBuilder)
    expect(spy).toHaveBeenCalledWith(cmd.options, mockBuilder)
    expect(mockBuilder.command).toHaveBeenCalled()
  })

  it('should make raw event with _extra and _script', async () => {
    const { adapter } = createAdapter()
    // @ts-expect-error: private method
    const result = await adapter.makeRawEvent(mockBuilder)

    expect(result).toEqual({ foo: 'bar', _extra: ['extra'], _script: 'script' })
  })

  it('should handle valid event flow in run()', async () => {
    AdapterEventBuilder.create = vi.fn(({ resolver }) => resolver({}))
    vi.mocked(yargs).mockReturnValue(mockBuilder)

    const { adapter } = createAdapter()
    const spy = vi.spyOn(adapter as any, 'registerAppCommands').mockReturnValue(adapter)
    const rawEvent = { task: 'run' }

    vi.spyOn(adapter as any, 'makeRawEvent').mockResolvedValue(rawEvent)
    vi.spyOn(adapter as any, 'eventListener').mockResolvedValue('CLI_RESULT')
    const result = await adapter.run()

    expect(result).toBe('CLI_RESULT')
    expect(mockBuilder.showHelp).not.toHaveBeenCalled()
    expect(spy).toHaveBeenCalled()
  })

  it('should normalize response codes to POSIX exit codes and apply them to the process', () => {
    const { adapter } = createAdapter()
    const toPosix = (code: any): number => (adapter as any).toPosixExitCode(code)

    expect(toPosix(0)).toBe(0) // success
    expect(toPosix(200)).toBe(0) // 2xx status → success
    expect(toPosix(204)).toBe(0)
    expect(toPosix(COMMAND_NOT_FOUND_CODE)).toBe(127) // command not found
    expect(toPosix(500)).toBe(1) // out-of-range error → general failure
    expect(toPosix(NaN)).toBe(1) // unusable → general failure
    expect(toPosix(2)).toBe(2) // already a POSIX code → passthrough

    ;(adapter as any).applyExitCode(500)
    expect(process.exitCode).toBe(1)
    process.exitCode = 0 // reset so the test process itself exits clean
  })

  it('should print help if command not found', async () => {
    AdapterEventBuilder.create = vi.fn(({ resolver }) => resolver({}))
    vi.mocked(yargs).mockReturnValue(mockBuilder)

    const { adapter } = createAdapter()
    const spy = vi.spyOn(adapter as any, 'registerAppCommands').mockReturnValue(adapter)
    const rawEvent = { task: 'run' }

    vi.spyOn(adapter as any, 'makeRawEvent').mockResolvedValue(rawEvent)
    vi.spyOn(adapter as any, 'eventListener').mockResolvedValue(COMMAND_NOT_FOUND_CODE)
    const result = await adapter.run()

    expect(result).toBe(COMMAND_NOT_FOUND_CODE)
    expect(mockBuilder.showHelp).toHaveBeenCalled()
    expect(spy).toHaveBeenCalled()
  })

  it('should run eventListener successfully', async () => {
    const { adapter } = createAdapter()
    const rawEvent = { test: true } as any

    // @ts-expect-error - private method
    const result = await adapter.eventListener(rawEvent, mockBuilder)
    expect(result).toBe('ok')
  })

  it('should handle errors and build raw response', async () => {
    const error = new Error('boom')
    const mockBuilder = vi.fn().mockResolvedValue({ statusCode: 500 })
    const { adapter } = createAdapter()

    vi.spyOn(adapter as any, 'resolveEventHandler').mockImplementation(() => {
      throw error
    })
    vi.spyOn(adapter as any, 'handleError').mockResolvedValue(mockBuilder)
    vi.spyOn(adapter as any, 'buildRawResponse').mockResolvedValue({ statusCode: 500 })

    const response = await (adapter as any).eventListener({ test: true }, {})

    expect(response).toEqual({ statusCode: 500 })
  })

  it('should call registerCommand correctly', () => {
    const { adapter } = createAdapter()
    const options = {
      name: 'hello',
      args: ['<who>'],
      alias: ['h'],
      desc: 'say hello',
      options: vi.fn()
    }

    // @ts-expect-error - private method
    adapter.registerCommand(options, mockBuilder)
    expect(mockBuilder.command).toHaveBeenCalledWith(['hello <who>', 'h'], 'say hello', options.options)
  })

  it('should call registerCommand correctly with missing values', () => {
    const { adapter } = createAdapter()
    const options = {
      name: 'hello',
      options: vi.fn()
    }

    // @ts-expect-error - private method
    adapter.registerCommand(options, mockBuilder)
    expect(mockBuilder.command).toHaveBeenCalledWith(['hello'], '', options.options)
  })
})
