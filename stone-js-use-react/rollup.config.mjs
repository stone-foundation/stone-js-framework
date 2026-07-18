import del from 'rollup-plugin-delete'
import { dts } from 'rollup-plugin-dts'
import multi from '@rollup/plugin-multi-entry'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeExternals from 'rollup-plugin-node-externals'

export default [
  {
    input: [
      'src/**/*.{ts,tsx}',
      '!src/server/**/*' // browser build
    ],
    output: [
      { format: 'es', file: 'dist/browser.js' }
    ],
    plugins: [
      multi(),
      nodeExternals(), // Must always be before `nodeResolve()`.
      nodeResolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
        exportConditions: ['node', 'import', 'require', 'default']
      }),
      typescript({
        noEmitOnError: true,
        tsconfig: './tsconfig.build.json',
      }),
      commonjs()
    ]
  },
  {
    input: [
      'src/**/*.{ts,tsx}',
      '!src/browser/**/*' // server build
    ],
    output: [
      { format: 'es', file: 'dist/index.js' }
    ],
    plugins: [
      multi(),
      nodeExternals(), // Must always be before `nodeResolve()`.
      nodeResolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
        exportConditions: ['node', 'import', 'require', 'default']
      }),
      typescript({
        noEmitOnError: true,
        tsconfig: './tsconfig.build.json',
      }),
      commonjs()
    ]
  },
  {
    input: [
      'dist/**/*.d.ts',
      '!dist/server/**/*.d.ts', // browser build
      '!dist/index.d.ts' // never re-ingest the previous build's bundled output (stale-dts guard)
    ],
    output: [{ format: 'es' , file: 'dist/index.d.ts' }],
    plugins: [
      multi(),
      dts(),
      del({
        targets: [
          'dist/**/',
          'dist/**/*.d.ts',
          '!dist/index.d.ts'
        ],
        hook: 'buildEnd'
      })
    ],
  },
]