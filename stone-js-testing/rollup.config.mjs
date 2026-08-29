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
    // The agnostic half: `createTestApp`, the client, the bindings, the generic event. It imports no
    // platform package, which is what lets both of the others be optional.
    {
      input: ['src/**/*.ts', '!src/http.ts', '!src/browser.ts', '!src/vitest.ts'],
      file: 'dist/index.js',
      barrel: { exclude: ['http', 'browser', 'vitest'] }
    },
    { input: ['src/http.ts'], file: 'dist/http.js', multiEntry: false },
    { input: ['src/browser.ts'], file: 'dist/browser.js', multiEntry: false },
    // Loaded by a runner config, before anything else: its own entry so it pulls nothing with it.
    { input: ['src/vitest.ts'], file: 'dist/vitest.js', multiEntry: false }
  ]
})
