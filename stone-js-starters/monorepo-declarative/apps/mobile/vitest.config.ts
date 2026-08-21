import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Under Node there is no React Native, and the screen imports its primitives at module scope, so
  // the specifier has to resolve somewhere. `tests/stubs/react-native.ts` explains what it stands
  // for and where the line is drawn.
  resolve: {
    alias: {
      'react-native': fileURLToPath(new URL('./tests/stubs/react-native.ts', import.meta.url))
    }
  },
  // `experimentalDecorators` is enabled in tsconfig.json for tsc TYPING only (the framework types
  // its decorators with the legacy signatures). At RUNTIME Stone.js requires standard 2023-11
  // decorators, so esbuild must ignore that flag and emit the standard semantics, `Symbol.metadata`
  // included (esbuild 0.25+ implements them correctly on its own).
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
      include: ['app/**/*.{ts,tsx}'],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage'
    }
  }
})
