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
    { input: ['src/**/*.ts', '!src/browser.ts'], file: 'dist/index.js', barrel: { exclude: ['browser'] } },
    // `./browser` on its own, so `@stone-js/browser-core` is only imported by a project that
    // renders. A service testing its handlers never loads this file.
    { input: ['src/browser.ts'], file: 'dist/browser.js', multiEntry: false }
  ]
})
