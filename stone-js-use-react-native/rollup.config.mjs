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
    // The renderer (`.`). It never includes the build-time code, which reads the filesystem: a
    // single `node:fs` import here and a native bundler could not load this package at all.
    {
      input: [
        'src/**/*.{ts,tsx}',
        '!src/cli/**/*',
        '!src/metro/**/*',
        '!src/build/**/*',
        '!src/navigation/**/*'
      ],
      file: 'dist/index.js',
      barrel: { exclude: ['cli/', 'metro/', 'build/', 'navigation/'] }
    },
    // The native navigator (`./navigation`). Kept out of the main bundle so that
    // `@react-navigation/native` and its native dependencies stay optional: an application happy
    // with `StoneNativeApp` installs none of them, and a bundler never looks for them.
    { input: ['src/navigation/index.ts'], file: 'dist/navigation.js', multiEntry: false },
    // The CLI plugin (`./cli`). `multiEntry: false` because auto-discovery reads this bundle's
    // default export, and multi-entry re-exports named exports only.
    { input: ['src/cli/index.ts'], file: 'dist/cli.js', multiEntry: false },
    // The Metro integration (`./metro`), loaded from a project's `metro.config.js`.
    { input: ['src/metro/index.ts'], file: 'dist/metro.js', multiEntry: false }
  ]
})
