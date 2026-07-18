import { rollupBuildConfig, rollupBundleConfig } from '../../src/server/rollup-config'

describe('rollupBuildConfig', () => {
  it('should have correct input and output config', () => {
    expect(rollupBuildConfig.input).toBe('app/**/*.ts')
    expect(rollupBuildConfig.context).toBe('globalThis')
    expect(rollupBuildConfig.output).toEqual({
      format: 'es',
      file: 'dist/app.mjs'
    })
  })

  it('should include necessary plugins in correct order', () => {
    const pluginNames = (rollupBuildConfig.plugins as any[]).map(p => p.name)

    expect(pluginNames[0]).toBe('multi-entry')
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
      file: 'dist/app.mjs'
    })
  })

  it('should include a subset of plugins (no babel, multi)', () => {
    const pluginNames = (rollupBundleConfig.plugins as any[]).map(p => p.name)

    expect(pluginNames).toContain('node-externals')
    expect(pluginNames).toContain('node-resolve')
    expect(pluginNames).toContain('json')
    expect(pluginNames).toContain('commonjs')
    expect(pluginNames).not.toContain('babel')
    expect(pluginNames).not.toContain('multi-entry')
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
