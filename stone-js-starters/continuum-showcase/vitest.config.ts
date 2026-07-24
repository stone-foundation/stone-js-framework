import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Mirror the CLI's static-asset aliases (see stone.config.mjs) so component imports like
  // `import logo from '@img/logo.svg'` also resolve under the test runner.
  resolve: {
    alias: {
      '@img': fileURLToPath(new URL('./assets/images', import.meta.url)),
      '@css': fileURLToPath(new URL('./assets/css', import.meta.url)),
      '@assets': fileURLToPath(new URL('./assets', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['./tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8',
      include: ['app/**/*.ts', 'app/**/*.tsx'],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      watermarks: {
        statements: [60, 80],
        functions: [60, 80],
        branches: [60, 80],
        lines: [60, 80]
      }
    }
  }
})
