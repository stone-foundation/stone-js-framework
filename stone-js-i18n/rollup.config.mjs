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
    // Browser build: everything except the Node-only filesystem loader.
    { input: ['src/**/*.ts', '!src/server/**/*'], file: 'dist/browser.js' },
    // Default (Node) build: everything except the browser stubs.
    { input: ['src/**/*.ts', '!src/browser/**/*'], file: 'dist/index.js', barrel: {} }
  ]
})
