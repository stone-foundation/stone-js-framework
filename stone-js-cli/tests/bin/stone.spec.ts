// Mocks
vi.mock('../../dist/index.js', () => ({
  stoneCliBlueprint: 'cli-blueprint'
}))

const run = vi.fn()
const configure = vi.fn(function (this: any, handler: Function) {
  handler({ set: vi.fn().mockReturnThis() })
  return this
})

vi.mock('@stone-js/core', () => ({
  stoneApp: vi.fn(() => ({ run, configure })),
  stoneBlueprint: 'core-blueprint'
}))

vi.mock('@stone-js/node-cli-adapter', () => ({
  nodeConsoleAdapterBlueprint: 'adapter-blueprint',
  MetaCommandRouterEventHandler: 'meta-event-handler'
}))

describe('stone.mjs (CLI entrypoint)', () => {
  let exitSpy: any

  beforeEach(() => {
    vi.resetModules()
    exitSpy = vi.spyOn(process, 'exit').mockReturnValue(0 as unknown as never)
  })

  afterEach(() => {
    vi.clearAllMocks()
    exitSpy.mockRestore()
  })

  it('should run CLI app with all blueprints and event handler', async () => {
    await import('../../bin/stone.mjs')

    expect(configure).toHaveBeenCalled()
    expect(run).toHaveBeenCalled()
    expect(exitSpy).not.toHaveBeenCalled()
  })

  it('should handle errors and exit with code 1', async () => {
    vi.mocked(run).mockRejectedValueOnce(new Error('Fake CLI error'))
    await import('../../bin/stone.mjs')
    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it('should attach signal handlers and exit on SIGINT/SIGTERM', async () => {
    const listeners = new Map()
    vi.spyOn(process, 'on').mockImplementation((event, cb) => {
      listeners.set(event, cb)
      return process
    })

    await import('../../bin/stone.mjs')

    expect(process.on).toHaveBeenCalledWith('SIGINT', expect.any(Function))
    expect(process.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function))

    listeners.get('SIGINT')?.()
    expect(exitSpy).toHaveBeenCalledWith(0)

    listeners.get('SIGTERM')?.()
    expect(exitSpy).toHaveBeenCalledWith(0)
  })
})
