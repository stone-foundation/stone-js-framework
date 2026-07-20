import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const defaultOutDir = mkdtempSync(join(tmpdir(), 'stone-ssg-default-'))
vi.mock('@stone-js/filesystem', () => ({ distPath: () => defaultOutDir }))

import {
  collectStaticTargets,
  targetToFilePath,
  writePrerendered,
  runSsg
} from '../../src/react/ssg'

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
