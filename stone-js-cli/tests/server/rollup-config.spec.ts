import { rollupBuildConfig, rollupBundleConfig } from '../../src/server/rollup-config'

describe('rollupBuildConfig', () => {
  it('should have correct input and output config', () => {
    expect(rollupBuildConfig.input).toBe('app/**/*.ts')
    expect(rollupBuildConfig.context).toBe('globalThis')
    expect(rollupBuildConfig.output).toEqual({
      format: 'es',
      file: 'dist/app.mjs',
      // A server artefact is one file: without this, any dynamic import in the app fails the build.
      inlineDynamicImports: true
    })
  })

  it('should include necessary plugins in correct order', () => {
    const pluginNames = (rollupBuildConfig.plugins as any[]).map(p => p.name)

    expect(pluginNames[0]).toBe('stone-multi-entry')
    expect(pluginNames[1]).toBe('node-externals')
    expect(pluginNames[2]).toBe('node-resolve')
    expect(pluginNames).toContain('json')
    expect(pluginNames).toContain('commonjs')
    expect(pluginNames).toContain('babel')
  })
})

describe('rollupBundleConfig', () => {
  it('should have correct input and output config', () => {
    expect(rollupBundleConfig.input).toBe('app/**/*.ts')
    expect(rollupBundleConfig.context).toBe('globalThis')
    expect(rollupBundleConfig.output).toEqual({
      format: 'es',
      file: 'dist/app.mjs',
      inlineDynamicImports: true
    })
  })

  it('should include a subset of plugins (no babel, multi)', () => {
    const pluginNames = (rollupBundleConfig.plugins as any[]).map(p => p.name)

    expect(pluginNames).toContain('node-externals')
    expect(pluginNames).toContain('node-resolve')
    expect(pluginNames).toContain('json')
    expect(pluginNames).toContain('commonjs')
    expect(pluginNames).not.toContain('babel')
    expect(pluginNames).not.toContain('stone-multi-entry')
  })

  it('should suppress circular dependency warning', () => {
    const warnMock = vi.fn()
    const circularWarning = {
      code: 'CIRCULAR_DEPENDENCY',
      message: 'node_modules/foo/bar.js -> node_modules/bar/baz.js'
    }

    // Should be suppressed
    rollupBundleConfig.onwarn?.(circularWarning, warnMock)
    expect(warnMock).not.toHaveBeenCalled()

    // Should not suppress other warnings
    const otherWarning = { code: 'UNKNOWN', message: 'something else' }
    rollupBundleConfig.onwarn?.(otherWarning, warnMock)
    expect(warnMock).toHaveBeenCalledWith(otherWarning)
  })
})

describe('isUnresolvableOptionalPeer', () => {
  const scopeDir = '/proj/node_modules/@stone-js'

  beforeEach(() => {
    vi.resetModules()
  })

  const loadWith = async (manifests: Record<string, unknown>, resolvable: string[]): Promise<any> => {
    vi.doMock('@stone-js/filesystem', () => ({
      basePath: (...parts: string[]) => ['/proj', ...parts].join('/')
    }))
    vi.doMock('node:fs', () => ({
      existsSync: (p: string) => p === scopeDir || p in manifests,
      readdirSync: () => Object.keys(manifests).map((p) => p.split('/').slice(-2)[0])
    }))
    vi.doMock('fs-extra', () => ({
      default: { readJsonSync: (p: string) => manifests[p] }
    }))
    vi.doMock('node:module', () => ({
      createRequire: () => ({
        resolve: (name: string) => {
          if (resolvable.includes(name)) { return `/proj/node_modules/${name}` }
          throw new Error('Cannot find module')
        }
      })
    }))
    return await import('../../src/server/rollup-config')
  }

  it('treats an optional peer the project did not install as external', async () => {
    // The reported noise: js-yaml is imported lazily by config-source, but Rollup still sees the
    // specifier and warns on every consumer build, even when no YAML source is used.
    const mod = await loadWith({
      [`${scopeDir}/config-source/package.json`]: {
        peerDependenciesMeta: { 'js-yaml': { optional: true }, '@aws-sdk/client-ssm': { optional: true } }
      }
    }, [])

    expect(mod.isUnresolvableOptionalPeer('js-yaml')).toBe(true)
    expect(mod.isUnresolvableOptionalPeer('@aws-sdk/client-ssm')).toBe(true)
  })

  it('leaves an installed optional peer alone', async () => {
    const mod = await loadWith({
      [`${scopeDir}/realtime/package.json`]: {
        peerDependenciesMeta: { ws: { optional: true }, ioredis: { optional: true } }
      }
    }, ['ws'])

    expect(mod.isUnresolvableOptionalPeer('ws')).toBe(false)
    expect(mod.isUnresolvableOptionalPeer('ioredis')).toBe(true)
  })

  it('copes with a manifest that declares no peer metadata', async () => {
    const mod = await loadWith({
      [`${scopeDir}/core/package.json`]: { name: '@stone-js/core' }
    }, [])

    expect(mod.isUnresolvableOptionalPeer('js-yaml')).toBe(false)
  })

  it('skips a scoped directory that has no manifest', async () => {
    vi.doMock('@stone-js/filesystem', () => ({ basePath: (...p: string[]) => ['/proj', ...p].join('/') }))
    vi.doMock('node:fs', () => ({
      existsSync: (p: string) => p === scopeDir,   // the directory exists, its package.json does not
      readdirSync: () => ['half-installed']
    }))
    vi.doMock('fs-extra', () => ({ default: { readJsonSync: () => undefined } }))
    vi.doMock('node:module', () => ({ createRequire: () => ({ resolve: () => '/x' }) }))

    const mod: any = await import('../../src/server/rollup-config')
    expect(mod.isUnresolvableOptionalPeer('js-yaml')).toBe(false)
  })

  it('covers subpaths of an absent peer, and ignores unrelated ids', async () => {
    const mod = await loadWith({
      [`${scopeDir}/cache/package.json`]: { peerDependenciesMeta: { ioredis: { optional: true } } }
    }, [])

    expect(mod.isUnresolvableOptionalPeer('ioredis/cluster')).toBe(true)
    expect(mod.isUnresolvableOptionalPeer('react')).toBe(false)
  })

  it('ignores required peers and copes with a missing scope directory', async () => {
    const withRequiredPeer = await loadWith({
      [`${scopeDir}/use-view/package.json`]: {
        peerDependenciesMeta: { '@stone-js/core': { optional: false } }
      }
    }, [])
    expect(withRequiredPeer.isUnresolvableOptionalPeer('@stone-js/core')).toBe(false)

    vi.resetModules()
    vi.doMock('@stone-js/filesystem', () => ({ basePath: (...p: string[]) => ['/nowhere', ...p].join('/') }))
    vi.doMock('node:fs', () => ({ existsSync: () => false, readdirSync: () => [] }))
    const empty: any = await import('../../src/server/rollup-config')
    expect(empty.isUnresolvableOptionalPeer('js-yaml')).toBe(false)
  })
})

describe('onwarnSkipVendorCycles', () => {
  it('drops node_modules cycles and keeps everything else', async () => {
    const { onwarnSkipVendorCycles } = await import('../../src/server/rollup-config')
    const warn = vi.fn()

    onwarnSkipVendorCycles({ code: 'CIRCULAR_DEPENDENCY', message: 'Circular dependency: node_modules/zod/x.js' } as any, warn)
    onwarnSkipVendorCycles({ code: 'CIRCULAR_DEPENDENCY', ids: ['/app/node_modules/a.js', '/app/b.js'] } as any, warn)
    expect(warn).not.toHaveBeenCalled()

    // A cycle in the user's own code stays visible: that one is actionable.
    onwarnSkipVendorCycles({ code: 'CIRCULAR_DEPENDENCY', message: 'Circular dependency: app/a.ts -> app/b.ts' } as any, warn)
    onwarnSkipVendorCycles({ code: 'UNRESOLVED_IMPORT', message: 'node_modules/whatever' } as any, warn)
    expect(warn).toHaveBeenCalledTimes(2)
  })
})
