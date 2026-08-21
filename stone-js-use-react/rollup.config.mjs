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
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
  builds: [
    { input: ['src/**/*.{ts,tsx}', '!src/server/**/*', '!src/cli/**/*'], file: 'dist/browser.js' },
    {
      input: ['src/**/*.{ts,tsx}', '!src/browser/**/*', '!src/cli/**/*'],
      file: 'dist/index.js',
      barrel: { exclude: ['server/', 'cli/'] }
    },
    // The build-time plugin (`./cli`). Never part of the runtime bundles: it reads the filesystem
    // and drives Vite, and a browser has no business seeing either. `multiEntry: false` because
    // auto-discovery reads this bundle's default export.
    { input: ['src/cli/index.ts'], file: 'dist/cli.js', multiEntry: false }
  ]
})
