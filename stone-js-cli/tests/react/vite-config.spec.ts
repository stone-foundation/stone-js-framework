import builtins from 'module'
import { viteConfig as getViteConfig } from '../../src/react/vite-config'

vi.mock('vite-plugin-babel', () => ({
  default: vi.fn(v => v)
}))

describe('viteConfig', () => {
  let viteConfig: any

  beforeEach(() => {
    viteConfig = getViteConfig({ command: 'build', mode: 'development' })
  })

  it('should export a valid Vite config object', () => {
    expect(viteConfig).toBeDefined()
    expect(viteConfig.plugins).toBeInstanceOf(Array)
    expect(viteConfig.plugins.length).toBe(2)

    // Plugin 1: @vitejs/plugin-react
    const reactPlugin = viteConfig.plugins[0][0]
    expect(typeof reactPlugin).toBe('object')
    expect(reactPlugin).toHaveProperty('name')

    // Plugin 2: vite-plugin-babel
    const babelPlugin = viteConfig.plugins[1]
    expect(typeof babelPlugin).toBe('object')
    expect(babelPlugin.filter('/src/file.js')).toBe(true)

    // Build config
    expect(viteConfig.build?.target).toBe('es2018')
    expect(viteConfig.build?.rollupOptions?.external).toContain('fs') // from builtins
    expect(viteConfig.build?.rollupOptions?.output?.manualChunks?.('node_modules/react')).toBe('vendor')
    expect(viteConfig.build?.rollupOptions?.output?.manualChunks?.('src/main.ts')).toBeUndefined()

    // SSR config
    expect(viteConfig.ssr).toEqual({
      noExternal: true,
      external: undefined
    })

    // Resolve config
    expect(viteConfig.resolve?.extensions).toContain('.tsx')
    expect(viteConfig.resolve?.extensions).toContain('.mjsx')

    // Esbuild config
    // expect(viteConfig.esbuild?.jsxInject).toBe('import React from \'react\'')
  })

  it('should match all expected extensions', () => {
    const expected = ['.js', '.mjs', '.ts', '.jsx', '.mjsx', '.tsx', '.json']
    expect(viteConfig.resolve?.extensions).toEqual(expected)
  })

  it('should contain all Node.js built-ins and node: regex in external', () => {
    const external = viteConfig.build?.rollupOptions?.external
    for (const mod of builtins.builtinModules) {
      expect(external).toContain(mod)
    }
    expect(external.some((e: unknown) => e instanceof RegExp && e.toString() === '/node:/')).toBe(true)
  })
})
