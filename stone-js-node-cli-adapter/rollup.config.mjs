import json from '@rollup/plugin-json'
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
  json,
  builds: [
    { input: ['src/**/*.ts', '!src/browser/**/*'], file: 'dist/index.js', barrel: { exclude: ['browser/'] } },
    {
      input: ['src/constants.ts', 'src/errors/**/*.ts', 'src/browser/**/*.ts', 'src/blueprint/**/*.ts', 'src/decorators/Command.ts'],
      file: 'dist/browser.js'
    }
  ]
})
