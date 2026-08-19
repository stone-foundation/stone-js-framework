import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeExternals from 'rollup-plugin-node-externals'
import { dtsExtensions } from '../rollup.config.base.mjs'

export default [
  {
    input: 'src/index.ts',
    output: [
      { format: 'es', file: 'dist/index.js', sourcemap: true }
    ],
    plugins: [
      nodeExternals(), // Must always be before `nodeResolve()`.
      nodeResolve({
        extensions: ['.js', '.ts', '.mjs'],
        exportConditions: ['node', 'import', 'require', 'default']
      }),
      typescript({
        noEmitOnError: true,
        tsconfig: './tsconfig.build.json'
      }),
      // This package has a real `src/index.ts`, so it does not need the shared barrel, but its
      // declarations need the same `.js` extensions to resolve under `moduleResolution: nodenext`.
      dtsExtensions()
    ]
  }
]
