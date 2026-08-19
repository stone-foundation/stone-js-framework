import json from '@rollup/plugin-json'
import babel from '@rollup/plugin-babel'
import { multiEntry } from './multiEntry'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeExternals from 'rollup-plugin-node-externals'
import fsExtra from 'fs-extra'
import { join } from 'node:path'
import { basePath } from '@stone-js/filesystem'
import { createRequire } from 'node:module'
import { existsSync, readdirSync } from 'node:fs'
import { defineConfig, RollupLog, LoggingFunction } from 'rollup'

const { readJsonSync } = fsExtra

/** Memoized set of optional peers no consumer installed, computed once per build. */
let unresolvablePeers: Set<string> | undefined

/**
 * Collect the optional peer dependencies declared by the installed `@stone-js/*` packages that the
 * project has NOT installed.
 *
 * Nine packages ship optional peers (js-yaml, ioredis, ws, the cloud SDKs...): each is imported
 * lazily, behind the branch that needs it, precisely so an app pays for only what it uses. Rollup
 * still sees the specifier and, unable to resolve it, warns "could not be resolved - treating it as
 * an external dependency" on every build. Treating them as external up front is what the warning
 * suggests anyway, minus the noise, and it is scoped to what is genuinely absent: an installed
 * optional peer keeps its normal resolution.
 *
 * @returns The unresolvable optional peer names.
 */
function collectUnresolvableOptionalPeers (): Set<string> {
  if (unresolvablePeers !== undefined) { return unresolvablePeers }

  unresolvablePeers = new Set<string>()
  const scopeDir = basePath('node_modules', '@stone-js')

  if (!existsSync(scopeDir)) { return unresolvablePeers }

  const require = createRequire(basePath('package.json'))

  for (const name of readdirSync(scopeDir)) {
    const manifest = join(scopeDir, name, 'package.json')
    if (!existsSync(manifest)) { continue }

    const meta = readJsonSync(manifest, { throws: false })?.peerDependenciesMeta ?? {}

    for (const [peer, options] of Object.entries<{ optional?: boolean }>(meta)) {
      if (options?.optional !== true) { continue }
      try {
        require.resolve(peer)
      } catch {
        unresolvablePeers.add(peer)
      }
    }
  }

  return unresolvablePeers
}

/**
 * Whether a module id is an optional peer the project did not install.
 *
 * Used as Rollup's `external` predicate. Subpaths count (`ioredis/cluster`), since a package that is
 * absent cannot have resolvable subpaths either.
 *
 * @param id - The module id Rollup is resolving.
 * @returns True when the id must be treated as external.
 */
export function isUnresolvableOptionalPeer (id: string): boolean {
  const peers = collectUnresolvableOptionalPeers()
  return peers.has(id) || [...peers].some((peer) => id.startsWith(`${peer}/`))
}

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
  external: isUnresolvableOptionalPeer,
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
  external: isUnresolvableOptionalPeer,
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
