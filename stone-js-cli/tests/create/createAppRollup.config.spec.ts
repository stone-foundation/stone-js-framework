import babel from '@rollup/plugin-babel'
import { multiEntry } from '../../src/server/multiEntry'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { createAppRollupConfig } from '../../src/create/createAppRollup.config'

describe('createAppRollupConfig', () => {
  it('should define correct input/output properties', () => {
    expect(createAppRollupConfig.input).toBe('app/**/*.ts')
    expect(createAppRollupConfig.output).toEqual({
      dir: 'dist',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'app',
      entryFileNames: '[name].js'
    })
  })

  it('should include expected Rollup plugins in correct order', () => {
    const plugins: any = createAppRollupConfig.plugins ?? []
    expect(plugins).toHaveLength(3)

    expect(plugins[0].name).toBe(multiEntry().name)
    expect(plugins[1].name).toBe(nodeResolve().name)
    expect(plugins[2].name).toBe(babel({
      babelrc: false,
      configFile: false,
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.ts', '.tsx'],
      presets: [['@babel/preset-typescript', { allowDeclareFields: true }]],
      plugins: [['@babel/plugin-syntax-decorators', { version: '2023-11' }]]
    }).name)
  })
})
