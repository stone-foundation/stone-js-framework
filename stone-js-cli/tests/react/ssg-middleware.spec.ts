import { EventEmitter } from 'node:events'
import { CliError } from '../../src/errors/CliError'

const spawnMock = vi.fn()
const runSsgMock = vi.fn()

vi.mock('node:child_process', () => ({ spawn: (...a: any[]) => spawnMock(...a), ChildProcess: class {} }))
vi.mock('../../src/react/ssg', () => ({ runSsg: (...a: any[]) => runSsgMock(...a) }))
vi.mock('@stone-js/filesystem', async (mod) => ({
  ...(await mod<any>()),
  distPath: (p = '') => `/dist/${p}`,
  basePath: (p = '') => `/base/${p}`,
  buildPath: (p = '') => `/build/${p}`
}))

/**
 * A fake child process whose stdout/stderr emit on demand, to drive `waitForServer`.
 */
const makeChild = (behavior: 'url' | 'exit' | 'stderr-url' | 'exit-stderr'): any => {
  const child: any = new EventEmitter()
  child.stdout = new EventEmitter()
  child.stderr = new EventEmitter()
  child.kill = vi.fn()
  queueMicrotask(() => {
    if (behavior === 'url') { child.stdout.emit('data', Buffer.from('Server listening on http://localhost:3000')) }
    if (behavior === 'stderr-url') { child.stderr.emit('data', Buffer.from('ready http://localhost:4000')) }
    if (behavior === 'exit') { child.emit('exit', 1) }
    if (behavior === 'exit-stderr') { child.stderr.emit('data', Buffer.from('boom crash')); child.emit('exit', null) }
  })
  return child
}

const makeContext = (): any => ({
  blueprint: {
    get: vi.fn((key: string, fallback: any) => {
      if (key === 'stone.builder.output') { return 'server.mjs' }
      if (key === 'stone.builder.ssg.routes') { return ['/'] }
      if (key === 'stone.adapter.url') { return 'http://localhost:8080' }
      return fallback
    })
  },
  commandOutput: { info: vi.fn() }
})

describe('GenerateStaticSiteMiddleware (SSG)', () => {
  let GenerateStaticSiteMiddleware: any

  beforeEach(async () => {
    vi.clearAllMocks()
    GenerateStaticSiteMiddleware = (await import('../../src/react/ReactBuildMiddleware')).GenerateStaticSiteMiddleware
  })

  it('pre-renders each route against the spawned SSR server and stops it', async () => {
    spawnMock.mockReturnValue(makeChild('url'))
    runSsgMock.mockImplementation(async (opts: any) => {
      const result = await opts.render({ path: '/' })
      expect(result.html).toBe('<html>ok</html>')
      return ['/dist/index.html']
    })
    vi.stubGlobal('fetch', vi.fn(async () => ({ text: async () => '<html>ok</html>', status: 200 })))

    const context = makeContext()
    const next = vi.fn().mockResolvedValue(context.blueprint)
    await GenerateStaticSiteMiddleware(context, next)

    expect(context.commandOutput.info).toHaveBeenCalledWith(expect.stringContaining('Pre-rendered 1 route'))
    expect(next).toHaveBeenCalled()
  })

  it('resolves the base URL from stderr too', async () => {
    spawnMock.mockReturnValue(makeChild('stderr-url'))
    runSsgMock.mockImplementation(async (opts: any) => { await opts.render({ path: '/' }); return ['x'] })
    const fetchMock = vi.fn(async () => ({ text: async () => 'x', status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const context = makeContext()
    await GenerateStaticSiteMiddleware(context, vi.fn().mockResolvedValue(context.blueprint))

    expect(fetchMock).toHaveBeenCalledWith(new URL('/', 'http://127.0.0.1:4000'))
  })

  it('fails with a clear error when the server exits without an HTTP endpoint', async () => {
    spawnMock.mockReturnValue(makeChild('exit'))
    const context = makeContext()

    await expect(GenerateStaticSiteMiddleware(context, vi.fn()))
      .rejects.toThrow(/SSG requires an HTTP server adapter/)
  })

  it('includes captured stderr and handles a null exit code', async () => {
    spawnMock.mockReturnValue(makeChild('exit-stderr'))
    const context = makeContext()

    await expect(GenerateStaticSiteMiddleware(context, vi.fn()))
      .rejects.toThrow(/boom crash/)
  })

  it('fails with a clear error when a route fetch is refused', async () => {
    spawnMock.mockReturnValue(makeChild('url'))
    runSsgMock.mockImplementation(async (opts: any) => await opts.render({ path: '/' }))
    // Reject with a non-Error so `error?.message ?? error` uses the raw value.
    vi.stubGlobal('fetch', vi.fn(async () => { throw 'ECONNREFUSED' }))

    const context = makeContext()
    await expect(GenerateStaticSiteMiddleware(context, vi.fn()))
      .rejects.toThrow(CliError)
  })
})
