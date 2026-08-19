import multi from '@rollup/plugin-multi-entry'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeExternals from 'rollup-plugin-node-externals'
import { createRollupConfig } from '../rollup.config.base.mjs'

export default createRollupConfig({
  multi,
  commonjs,
  typescript,
  nodeResolve,
  nodeExternals,
  builds: [
    // Node build: the full module (CLI command, MCP server, introspection, fs). Excludes the
    // browser stubs; the public `dist/index.d.ts` barrel is emitted here.
    { input: ['src/**/*.ts', '!src/cli.ts'], file: 'dist/index.js', barrel: { exclude: ['cli'] } },
    // The build-time CLI plugin (`./cli`): it participates in the build, so it never belongs to the
    // runtime bundle an application ships.
    // `multiEntry: false` because auto-discovery reads this bundle's DEFAULT export, and
    // multi-entry re-exports named exports only, which silently disables the whole plugin.
    { input: ['src/cli.ts'], file: 'dist/cli.js', multiEntry: false }
  ]
})
