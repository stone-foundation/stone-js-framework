import del from 'rollup-plugin-delete'
import json from '@rollup/plugin-json'
import { dts } from 'rollup-plugin-dts'
import multi from '@rollup/plugin-multi-entry'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeExternals from 'rollup-plugin-node-externals'

export default [
  {
    input: [
      'src/**/*.ts',
      '!src/browser/**/*'
    ],
    output: [
      { format: 'es', file: 'dist/index.js' }
    ],
    plugins: [
      multi(),
      nodeExternals(), // Must always be before `nodeResolve()`.
      nodeResolve({
        extensions: ['.js', '.mjs', '.ts'],
        exportConditions: ['node', 'import', 'require', 'default']
      }),
      json(),
      typescript({
        noEmitOnError: true,
        tsconfig: './tsconfig.build.json',
      }),
      commonjs()
    ]
  },
  {
    input: [
      'src/constants.ts',
      'src/errors/**/*.ts',
      'src/browser/**/*.ts',
      'src/blueprint/**/*.ts',
      'src/decorators/Command.ts'
    ],
    output: [
      { format: 'es', file: 'dist/browser.js' }
    ],
    plugins: [
      multi(),
      nodeExternals(), // Must always be before `nodeResolve()`.
      nodeResolve({
        extensions: ['.js', '.mjs', '.ts'],
        exportConditions: ['node', 'import', 'require', 'default']
      }),
      json(),
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
      '!dist/browser/**/*.d.ts'
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