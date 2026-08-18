import json from '@rollup/plugin-json'
import babel from '@rollup/plugin-babel'
import { multiEntry } from './multiEntry'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeExternals from 'rollup-plugin-node-externals'
import { defineConfig, RollupLog, LoggingFunction } from 'rollup'

/**
 * Drop circular-dependency warnings coming from `node_modules`, keep everything else.
 *
 * Dependencies legitimately contain cycles (zod and zod-to-json-schema, reached through the MCP
 * SDK, emit around twenty lines on their own). The application author cannot act on any of them,
 * and a wall of warnings on an otherwise successful build reads as a failure. Cycles in the user's
 * own code still warn, because those are actionable.
 *
 * @param warning - The Rollup warning.
 * @param warn - The default Rollup warning handler.
 */
export function onwarnSkipVendorCycles (warning: RollupLog, warn: LoggingFunction): void {
  if (
    warning.code === 'CIRCULAR_DEPENDENCY' &&
    /node_modules[/\\]/.test(`${warning.message ?? ''}${warning.ids?.join(' ') ?? ''}`)
  ) { return }

  warn(warning)
}

/**
 * Generate Rollup build options for the entire application.
*/
const rollupBuildConfig = defineConfig({
  input: 'app/**/*.ts',
  context: 'globalThis',
  output: {
    format: 'es',
    file: 'dist/app.mjs',
    // A server artefact is one file, so a dynamic `import()` anywhere in the app (lazy i18n
    // catalogs, a conditionally-loaded driver) otherwise fails the build with "when building
    // multiple chunks, the output.dir option must be used". Inlining keeps the single artefact and
    // still defers evaluation to the moment the import is awaited.
    inlineDynamicImports: true
  },
  plugins: [
    multiEntry(),
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
  ],
  onwarn: onwarnSkipVendorCycles
})

/**
 * Generate Rollup bundle options for the entire application.
*/
const rollupBundleConfig = defineConfig({
  input: 'app/**/*.ts',
  context: 'globalThis',
  output: {
    format: 'es',
    file: 'dist/app.mjs',
    // A server artefact is one file, so a dynamic `import()` anywhere in the app (lazy i18n
    // catalogs, a conditionally-loaded driver) otherwise fails the build with "when building
    // multiple chunks, the output.dir option must be used". Inlining keeps the single artefact and
    // still defers evaluation to the moment the import is awaited.
    inlineDynamicImports: true
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
  onwarn: onwarnSkipVendorCycles
})

export { rollupBuildConfig, rollupBundleConfig }
