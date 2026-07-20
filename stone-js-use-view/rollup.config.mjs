import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeExternals from 'rollup-plugin-node-externals'

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
      })
    ]
  }
]
