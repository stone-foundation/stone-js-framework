// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const defaultOutDir = mkdtempSync(join(tmpdir(), 'stone-ssg-default-'))
vi.mock('@stone-js/filesystem', () => ({ distPath: () => defaultOutDir }))

import {
  collectStaticTargets,
  expandPath,
  targetToFilePath,
  writePrerendered,
  runSsg
} from '../../src/cli/ssg'

describe('collectStaticTargets', () => {
  it('keeps only static GET routes and dedupes', () => {
    const targets = collectStaticTargets([
      { path: '/' },
      { path: '/about', methods: ['GET'] },
      { path: '/blog/:slug' },
      { path: '/files/*' },
      { path: '/api', methods: ['POST'] },
      { path: '/about' }
    ])
    expect(targets.map((t) => t.path)).toEqual(['/', '/about'])
  })

  it('expands a route that declares several path aliases', () => {
    const targets = collectStaticTargets([
      { path: ['/', '/home'], methods: ['GET'] },
      { path: ['/docs', '/docs/:section'] }
    ])
    // Both aliases of the first route; only the static alias of the second.
    expect(targets.map((t) => t.path)).toEqual(['/', '/home', '/docs'])
  })

  it('reports what it could not expand instead of dropping it silently', () => {
    // The silent hole is the real defect: a site pre-renders a fraction of itself and nothing says
    // so. The message has to name what would fix it.
    const onSkipped = vi.fn()

    collectStaticTargets([{ path: '/blog/:slug' }, { path: '/:lang/about' }], { onSkipped })

    expect(onSkipped).toHaveBeenCalledOnce()
    expect(onSkipped.mock.calls[0][0]).toEqual({
      paths: ['/blog/:slug', '/:lang/about'],
      segments: ['slug', 'lang']
    })
  })

  it('ignores a definition whose path is not a string', () => {
    // Definitions come from a scan, so a malformed one must be skipped rather than crash the build.
    expect(collectStaticTargets([{ path: [undefined as any, '/ok'] }])).toEqual([{ path: '/ok' }])
  })

  it('says nothing when there is nothing to report', () => {
    const onSkipped = vi.fn()

    collectStaticTargets([{ path: '/about' }], { onSkipped })

    expect(onSkipped).not.toHaveBeenCalled()
  })

  it('recovers a whole site from a parameterized global prefix', () => {
    // The case that motivated this: one `:lang` on the router prefix lands on every route, so
    // every route was skipped and auto-discovery collapsed from all pages to none.
    const targets = collectStaticTargets(
      [{ path: '/:lang(en|fr)?/' }, { path: '/:lang(en|fr)?/about' }, { path: '/:lang(en|fr)?/blog' }],
      { params: { lang: ['en', 'fr'] } }
    )

    expect(targets.map((t) => t.path)).toEqual([
      '/', '/en', '/fr',
      '/about', '/en/about', '/fr/about',
      '/blog', '/en/blog', '/fr/blog'
    ])
  })
})

describe('expandPath', () => {
  it('substitutes a required segment', () => {
    const { targets } = expandPath('/plans/:tier', { tier: ['free', 'pro'] })

    expect(targets).toEqual([
      { path: '/plans/free', params: { tier: 'free' } },
      { path: '/plans/pro', params: { tier: 'pro' } }
    ])
  })

  it('an optional segment also yields the path without it, canonical form first', () => {
    // This single detail reproduces the whole "bare path plus prefixed twins" grid that localized
    // sites were rebuilding by hand.
    const { targets } = expandPath('/:lang?/about', { lang: ['en', 'fr'] })

    expect(targets.map((t) => t.path)).toEqual(['/about', '/en/about', '/fr/about'])
    // The bare form carries no value for the segment it left out.
    expect(targets[0].params).toBeUndefined()
    expect(targets[1].params).toEqual({ lang: 'en' })
  })

  it('reduces an optional segment at the root to the root itself', () => {
    const { targets } = expandPath('/:lang?', { lang: ['en'] })

    expect(targets.map((t) => t.path)).toEqual(['/', '/en'])
  })

  it('combines several segments as a cartesian product', () => {
    const { targets } = expandPath('/:lang?/blog/:slug', { lang: ['en', 'fr'], slug: ['a', 'b'] })

    expect(targets.map((t) => t.path)).toEqual([
      '/blog/a', '/blog/b', '/en/blog/a', '/en/blog/b', '/fr/blog/a', '/fr/blog/b'
    ])
  })

  it('keeps one segment consistent with itself when a path repeats it', () => {
    const { targets } = expandPath('/:lang/x/:lang', { lang: ['en', 'fr'] })

    expect(targets.map((t) => t.path)).toEqual(['/en/x/en', '/fr/x/fr'])
  })

  it('reads a constraint containing parentheses without cutting it short', () => {
    const { targets } = expandPath('/:lang((en|fr)-CA)?/about', { lang: ['en-CA', 'fr-CA'] })

    expect(targets.map((t) => t.path)).toEqual(['/about', '/en-CA/about', '/fr-CA/about'])
  })

  it('fails the build when a declared value contradicts the segment constraint', () => {
    // Pre-rendering a path the router can never match would ship a page nobody can reach, so a
    // typo has to stop the build rather than produce dead HTML.
    expect(() => expandPath('/:lang(en|fr)/about', { lang: ['en', 'de'] }))
      .toThrow(/"de".*:lang.*does not match.*en\|fr/)
  })

  it('leaves a path alone when its segments have no declared values', () => {
    const { targets, missing } = expandPath('/blog/:slug', { lang: ['en'] })

    expect(targets).toEqual([])
    expect(missing).toEqual(['slug'])
  })

  it('never expands a wildcard, and does not ask anyone to declare it', () => {
    // There is no segment name to declare values for, so reporting it would be noise.
    const { targets, missing } = expandPath('/files/*', { lang: ['en'] })

    expect(targets).toEqual([])
    expect(missing).toEqual([])
  })

  it('passes a static path straight through', () => {
    expect(expandPath('/about', {})).toEqual({ targets: [{ path: '/about' }], missing: [] })
  })

  it('ignores a colon that names nothing', () => {
    // `/a:/b` is not a segment: a bare colon has no name to declare values for.
    expect(expandPath('/a:/b', {})).toEqual({ targets: [{ path: '/a:/b' }], missing: [] })
  })

  it('substitutes a segment that does not follow a slash', () => {
    const { targets } = expandPath('/v:major', { major: ['1', '2'] })

    expect(targets.map((t) => t.path)).toEqual(['/v1', '/v2'])
  })

  it('drops only the segment when an optional one is mid-word, not the path before it', () => {
    // `/v:major?` absent must leave `/v`, not `''`: the leading slash belongs to the path here.
    const { targets } = expandPath('/v:major?', { major: ['1'] })

    expect(targets.map((t) => t.path)).toEqual(['/v', '/v1'])
  })
})

describe('targetToFilePath', () => {
  it('maps / to index.html and nested routes to clean URLs', () => {
    expect(targetToFilePath('/', '/out').replace(/\\/g, '/')).toBe('/out/index.html')
    expect(targetToFilePath('/blog/hello', '/out').replace(/\\/g, '/')).toBe('/out/blog/hello/index.html')
    expect(targetToFilePath('about', '/out').replace(/\\/g, '/')).toBe('/out/about/index.html')
  })
})

describe('writePrerendered / runSsg', () => {
  let outDir: string

  beforeEach(() => { outDir = mkdtempSync(join(tmpdir(), 'stone-ssg-')) })
  afterEach(() => { rmSync(outDir, { recursive: true, force: true }) })

  it('writes each result to <out>/<route>/index.html', () => {
    const written = writePrerendered([
      { path: '/', html: '<!doctype html><title>Home</title>' },
      { path: '/about', html: '<!doctype html><title>About</title>' }
    ], outDir)

    expect(written).toHaveLength(2)
    expect(existsSync(join(outDir, 'index.html'))).toBe(true)
    expect(readFileSync(join(outDir, 'about', 'index.html'), 'utf-8')).toContain('About')
  })

  it('runs the full pass: collect → render → write', async () => {
    const rendered: string[] = []
    const written = await runSsg({
      definitions: [{ path: '/' }, { path: '/about' }, { path: '/blog/:slug' }],
      extraTargets: [{ path: '/blog/hello', params: { slug: 'hello' } }],
      outDir,
      render: async (target) => {
        rendered.push(target.path)
        return { path: target.path, html: `<title>${target.path}</title>`, statusCode: 200 }
      }
    })

    // Static routes (/, /about) + the extra param target (/blog/hello); the raw :slug route is skipped.
    expect(rendered.sort()).toEqual(['/', '/about', '/blog/hello'])
    expect(written).toHaveLength(3)
    expect(readFileSync(join(outDir, 'blog', 'hello', 'index.html'), 'utf-8')).toContain('/blog/hello')
    expect(existsSync(join(outDir, 'index.html'))).toBe(true)
  })

  it('merges derived and configured routes without pre-rendering a path twice', async () => {
    const rendered: string[] = []
    const written = await runSsg({
      definitions: [{ path: '/' }, { path: '/about' }],
      extraTargets: [{ path: '/about' }, { path: '/contact' }], // /about duplicates a derived route
      outDir,
      render: async (target) => {
        rendered.push(target.path)
        return { path: target.path, html: `<title>${target.path}</title>`, statusCode: 200 }
      }
    })

    expect(rendered.sort()).toEqual(['/', '/about', '/contact'])
    expect(written).toHaveLength(3)
  })

  it('defaults extraTargets to none and outDir to distPath()', async () => {
    const written = await runSsg({
      definitions: [{ path: '/' }],
      render: async (target) => ({ path: target.path, html: '<title>home</title>', statusCode: 200 })
    })

    expect(written).toHaveLength(1)
    expect(existsSync(join(defaultOutDir, 'index.html'))).toBe(true)
  })
})

describe('a page the application could not render', () => {
  let outDir: string

  beforeEach(() => { outDir = mkdtempSync(join(tmpdir(), 'stone-ssg-')) })
  afterEach(() => { rmSync(outDir, { recursive: true, force: true }) })

  const failing = async (target: any): Promise<any> => target.path === '/broken'
    ? { path: target.path, html: '<title>Server Error</title>', statusCode: 500 }
    : { path: target.path, html: `<title>${String(target.path)}</title>`, statusCode: 200 }

  it('fails the build instead of shipping the error body as that page', async () => {
    // The defect this replaces: a pre-render is an HTTP request, so a page that throws answers with an
    // error body. That body was written as the page and the build exited 0, which means a site could
    // ship an error page that looked like content until a visitor found it.
    await expect(runSsg({ definitions: [{ path: '/' }, { path: '/broken' }], outDir, render: failing }))
      .rejects.toThrow(/could not render/)
  })

  it('names the page and what it answered', async () => {
    // "Build failed" sends someone hunting; the path and the status point straight at it.
    await expect(runSsg({ definitions: [{ path: '/broken' }], outDir, render: failing }))
      .rejects.toThrow(/\/broken answered 500/)
  })

  it('writes nothing at all, not even the pages that worked', async () => {
    // A partial output that looks complete is the same failure wearing a different hat: the next deploy
    // would publish a directory missing pages nobody was told about.
    await runSsg({ definitions: [{ path: '/' }, { path: '/broken' }], outDir, render: failing }).catch(() => {})

    expect(existsSync(join(outDir, 'index.html'))).toBe(false)
  })

  it('fails on a page the app does not serve, rather than saving its 404', async () => {
    // A configured route the application has no page for is a mistake in the configuration, and its 404
    // body is not the page that was asked for.
    await expect(runSsg({
      definitions: [{ path: '/' }],
      extraTargets: [{ path: '/typo' }],
      outDir,
      render: async (target: any) => ({
        path: target.path,
        html: '<title>Not Found</title>',
        statusCode: target.path === '/typo' ? 404 : 200
      })
    })).rejects.toThrow(/\/typo answered 404/)
  })

  it('still writes when a render reports no status at all', async () => {
    // `statusCode` is optional in the contract, and a renderer that does not report one has not
    // reported a failure either.
    const written = await runSsg({
      definitions: [{ path: '/' }],
      outDir,
      render: async (target: any) => ({ path: target.path, html: '<title>home</title>' })
    })

    expect(written).toHaveLength(1)
  })
})
