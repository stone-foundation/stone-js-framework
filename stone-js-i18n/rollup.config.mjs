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
    // The agnostic runtime (`.`) — never includes the build-time CLI plugin.
    { input: ['src/**/*.ts', '!src/cli.ts'], file: 'dist/index.js', barrel: { exclude: ['cli'] } },
    // The build-time CLI plugin (`./cli`) — build-only, kept out of the runtime bundle.
    // `multiEntry: false` because auto-discovery reads this bundle's DEFAULT export, and
    // multi-entry re-exports named exports only, which silently disabled the whole plugin.
    { input: ['src/cli.ts'], file: 'dist/cli.js', multiEntry: false }
  ]
})
