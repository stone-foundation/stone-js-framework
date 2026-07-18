import json from '@rollup/plugin-json'
import babel from '@rollup/plugin-babel'
import multi from '@rollup/plugin-multi-entry'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeExternals from 'rollup-plugin-node-externals'
import { defineConfig, RollupLog, LoggingFunction } from 'rollup'

/**
 * Generate Rollup build options for the entire application.
*/
const rollupBuildConfig = defineConfig({
  input: 'app/**/*.ts',
  context: 'globalThis',
  output: {
    format: 'es',
    file: 'dist/app.mjs'
  },
  plugins: [
    multi(),
    nodeExternals(), // Must always be before `nodeResolve()`.
    nodeResolve({
      extensions: ['.js', '.mjs', '.ts', '.json'],
      exportConditions: ['node', 'import', 'require', 'default']
    }),
    json(),
    commonjs({ include: /node_modules/, transformMixedEsModules: true }),
    babel({
      babelrc: false,
      configFile: false,
      babelHelpers: 'bundled',
      extensions: ['.js', '.mjs', '.ts'],
      presets: [
        ['@babel/preset-env', {
          targets: { node: '20' },
          bugfixes: true,
          modules: false,
          useBuiltIns: false
        }],
        '@babel/preset-typescript'
      ],
      // Decorators (TC39 2023-11) must run before the class-feature transforms. The class
      // property/static-block/private-method transforms are listed explicitly so static
      // properties, static blocks and private members are lowered deterministically —
      // independent of the preset-env target — which keeps decorated classes correct across
      // ES5/ES6 outputs instead of relying on the runtime's native class-feature support.
      plugins: [
        ['@babel/plugin-proposal-decorators', { version: '2023-11' }],
        '@babel/plugin-transform-class-static-block',
        '@babel/plugin-transform-class-properties',
        '@babel/plugin-transform-private-methods'
      ]
    })
  ]
})

/**
 * Generate Rollup bundle options for the entire application.
*/
const rollupBundleConfig = defineConfig({
  input: 'app/**/*.ts',
  context: 'globalThis',
  output: {
    format: 'es',
    file: 'dist/app.mjs'
  },
  plugins: [
    nodeExternals({ deps: false }), // Must always be before `nodeResolve()`.
    nodeResolve({
      extensions: ['.js', '.mjs', '.ts', '.json'],
      exportConditions: ['node', 'import', 'require', 'default']
    }),
    json(),
    commonjs({ include: /node_modules/, transformMixedEsModules: true })
  ],
  onwarn (warning: RollupLog, warn: LoggingFunction) {
    // Suppress only circular dependency warning
    if (
      warning.code === 'CIRCULAR_DEPENDENCY' &&
      /node_modules[/\\]/.test(warning.message)
    ) { return }

    warn(warning)
  }
})

export { rollupBuildConfig, rollupBundleConfig }
