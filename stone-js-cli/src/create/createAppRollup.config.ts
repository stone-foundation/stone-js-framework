import { defineConfig } from 'rollup'
import babel from '@rollup/plugin-babel'
import multi from '@rollup/plugin-multi-entry'
import { nodeResolve } from '@rollup/plugin-node-resolve'

/**
 * Generate Rollup build options for the entire application.
 */
export const createAppRollupConfig = defineConfig({
  input: 'app/**/*.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'app',
    entryFileNames: '[name].js'
  },
  plugins: [
    multi(),
    nodeResolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs']
    }),
    babel({
      babelrc: false,
      configFile: false,
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.ts', '.tsx'],
      presets: [
        ['@babel/preset-typescript', { allowDeclareFields: true }]
      ],
      plugins: [
        ['@babel/plugin-syntax-decorators', { version: '2023-11' }]
      ]
    })
  ]
})
