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
    // The agnostic runtime (`.`) — never includes the Node-only build plugin.
    { input: ['src/**/*.ts', '!src/cli.ts'], file: 'dist/index.js', barrel: { exclude: ['cli'] } },
    // The Node-only build plugin (`./cli`) — uses `node:fs`, kept out of the runtime bundle.
    { input: ['src/cli.ts'], file: 'dist/cli.js' }
  ]
})
