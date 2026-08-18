import { defineConfig } from 'vitest/config'

export default defineConfig({
  // `experimentalDecorators` is enabled in tsconfig.json for tsc TYPING only
  // (the framework types its decorators with the legacy signatures). At
  // RUNTIME Stone.js requires standard 2023-11 decorators, so esbuild must
  // ignore that flag and emit the standard semantics, `Symbol.metadata` included.
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: false
      }
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['./tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8',
      include: ['app/**/*.ts', 'adapter/**/*.ts'],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage'
    }
  }
})
