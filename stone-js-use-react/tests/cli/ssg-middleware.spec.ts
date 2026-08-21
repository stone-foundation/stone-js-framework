// @vitest-environment node
import { EventEmitter } from 'node:events'
import { CliError } from '@stone-js/cli'

const spawnMock = vi.fn()
const runSsgMock = vi.fn()

vi.mock('node:child_process', () => ({ spawn: (...a: any[]) => spawnMock(...a), ChildProcess: class {} }))
// Keep the real collectStaticTargets (the derivation under test); mock only the writer.
vi.mock('../../src/cli/ssg', async (mod) => ({
  ...(await mod<any>()),
  runSsg: (...a: any[]) => runSsgMock(...a)
}))
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
  // Stand-ins for real pipes, which are closable and are what keep a parent process alive.
  child.stdout.destroy = vi.fn()
  child.stderr.destroy = vi.fn()
  child.exitCode = null
  child.signalCode = null
  child.on('exit', (code: number | null) => { child.exitCode = code })
  // A well-behaved child exits when signalled; the stubborn one is exercised on its own below.
  child.kill = vi.fn(() => { queueMicrotask(() => child.emit('exit', 0)) })
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
    GenerateStaticSiteMiddleware = (await import('../../src/cli/ReactBuildMiddleware')).GenerateStaticSiteMiddleware
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

  it('runs the SSR server on the same Node that is building, not on whatever PATH resolves', async () => {
    spawnMock.mockReturnValue(makeChild('url'))
    runSsgMock.mockResolvedValue(['/dist/index.html'])
    vi.stubGlobal('fetch', vi.fn(async () => ({ text: async () => '<html>ok</html>', status: 200 })))

    const context = makeContext()
    await GenerateStaticSiteMiddleware(context, vi.fn().mockResolvedValue(context.blueprint))

    expect(spawnMock).toHaveBeenCalledWith(process.execPath, ['/dist/server.mjs'], expect.anything())
  })

  it('derives the pre-render set from the scanned page routes (zero-config)', async () => {
    spawnMock.mockReturnValue(makeChild('url'))
    let received: any
    runSsgMock.mockImplementation(async (opts: any) => { received = opts; return ['a', 'b'] })
    vi.stubGlobal('fetch', vi.fn(async () => ({ text: async () => 'x', status: 200 })))

    const context: any = {
      blueprint: {
        get: vi.fn((key: string, fallback: any) => {
          if (key === 'stone.builder.output') return 'server.mjs'
          if (key === 'stone.builder.ssg.definitions') return [{ path: '/' }, { path: '/about' }, { path: '/blog/:slug' }]
          if (key === 'stone.builder.ssg.routes') return [] // user added nothing
          if (key === 'stone.adapter.url') return 'http://localhost:8080'
          return fallback
        })
      },
      commandOutput: { info: vi.fn() }
    }
    await GenerateStaticSiteMiddleware(context, vi.fn().mockResolvedValue(context.blueprint))

    // Real definitions flow through; the parameterized route is not force-added here.
    expect(received.definitions.map((d: any) => (Array.isArray(d.path) ? d.path[0] : d.path)))
      .toEqual(['/', '/about', '/blog/:slug'])
    expect(received.extraTargets).toEqual([]) // nothing configured, and definitions exist -> no '/' fallback
  })

  it('reads the declared segment values and reports what it still cannot expand', async () => {
    // The wiring is the part a unit test cannot see: reading the right blueprint key, and giving
    // the collector somewhere to report the routes it had to skip.
    spawnMock.mockReturnValue(makeChild('url'))
    let received: any
    runSsgMock.mockImplementation(async (opts: any) => {
      received = opts
      opts.onSkipped({ paths: ['/blog/:slug'], segments: ['slug'] })
      return ['x']
    })
    vi.stubGlobal('fetch', vi.fn(async () => ({ text: async () => 'x', status: 200 })))

    const context: any = {
      blueprint: {
        get: vi.fn((key: string, fallback: any) => {
          if (key === 'stone.builder.output') return 'server.mjs'
          if (key === 'stone.builder.ssg.definitions') return [{ path: '/:lang?/about' }, { path: '/blog/:slug' }]
          if (key === 'stone.builder.ssg.routes') return []
          if (key === 'stone.builder.ssg.params') return { lang: ['en', 'fr'] }
          if (key === 'stone.adapter.url') return 'http://localhost:8080'
          return fallback
        })
      },
      commandOutput: { info: vi.fn() }
    }
    await GenerateStaticSiteMiddleware(context, vi.fn().mockResolvedValue(context.blueprint))

    expect(received.params).toEqual({ lang: ['en', 'fr'] })
    expect(context.commandOutput.info).toHaveBeenCalledWith(
      expect.stringContaining('SSG skipped 1 parameterized route(s). Declare values for `:slug`')
    )
  })

  it('resolves the base URL from stderr too', async () => {
    spawnMock.mockReturnValue(makeChild('stderr-url'))
    runSsgMock.mockImplementation(async (opts: any) => { await opts.render({ path: '/' }); return ['x'] })
    const fetchMock = vi.fn(async () => ({ text: async () => 'x', status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const context = makeContext()
    await GenerateStaticSiteMiddleware(context, vi.fn().mockResolvedValue(context.blueprint))

    // The crawl uses the configured host (localhost:8080) with the port the server announced (4000),
    // so it matches whatever the server actually bound (no forced 127.0.0.1 vs localhost mismatch).
    expect(fetchMock).toHaveBeenCalledWith(new URL('/', 'http://localhost:4000'))
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

describe('stopping the pre-render server', () => {
  let GenerateStaticSiteMiddleware: any

  beforeEach(async () => {
    vi.clearAllMocks()
    GenerateStaticSiteMiddleware = (await import('../../src/cli/ReactBuildMiddleware')).GenerateStaticSiteMiddleware
  })

  /** A server that answers SIGTERM by shutting down gracefully, and never finishing. */
  const stubbornChild = (): any => {
    const child: any = new EventEmitter()
    child.stdout = new EventEmitter()
    child.stderr = new EventEmitter()
    child.stdout.destroy = vi.fn()
    child.stderr.destroy = vi.fn()
    child.exitCode = null
    child.signalCode = null
    child.kill = vi.fn()
    queueMicrotask(() => child.stdout.emit('data', Buffer.from('http://localhost:3000')))
    return child
  }

  it('forces the child down when it does not answer SIGTERM', async () => {
    // The defect this replaces: SIGTERM is a request. A graceful shutdown waiting on a socket the
    // crawler left open never finishes, the child outlives the build, and its open pipes keep the CLI
    // alive: a build that had already printed its result hung instead of exiting.
    vi.useFakeTimers()
    const child = stubbornChild()
    spawnMock.mockReturnValue(child)
    runSsgMock.mockResolvedValue(['/'])

    const done = GenerateStaticSiteMiddleware(makeContext(), async (c: any) => c)
    await vi.advanceTimersByTimeAsync(5000)
    await done

    expect(child.kill).toHaveBeenCalledWith('SIGTERM')
    expect(child.kill).toHaveBeenCalledWith('SIGKILL')
    vi.useRealTimers()
  })

  it('releases the pipes it was reading, which are a reason of their own not to exit', async () => {
    vi.useFakeTimers()
    const child = stubbornChild()
    spawnMock.mockReturnValue(child)
    runSsgMock.mockResolvedValue(['/'])

    const done = GenerateStaticSiteMiddleware(makeContext(), async (c: any) => c)
    await vi.advanceTimersByTimeAsync(5000)
    await done

    expect(child.stdout.destroy).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('stops the server even when the pre-render failed', async () => {
    // The failure path is exactly where a leaked server hurts: the build has an error to report and
    // must still be able to exit to report it.
    const child = stubbornChild()
    child.kill = vi.fn(() => { queueMicrotask(() => child.emit('exit', 0)) })
    spawnMock.mockReturnValue(child)
    runSsgMock.mockRejectedValue(new CliError('SSG could not render 1 page(s)'))

    await expect(GenerateStaticSiteMiddleware(makeContext(), async (c: any) => c))
      .rejects.toThrow(/could not render/)
    expect(child.kill).toHaveBeenCalledWith('SIGTERM')
  })
})
