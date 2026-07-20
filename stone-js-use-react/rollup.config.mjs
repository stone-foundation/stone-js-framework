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
    { input: ['src/**/*.{ts,tsx}', '!src/server/**/*'], file: 'dist/browser.js' },
    { input: ['src/**/*.{ts,tsx}', '!src/browser/**/*'], file: 'dist/index.js', barrel: { exclude: ['server/'] } }
  ]
})
