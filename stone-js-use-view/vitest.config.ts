import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['./tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        // View engine: the remaining gap is chiefly the fluent head-manager builder and
        // deferred rendering paths — tracked for a follow-up test pass. Kept high and enforced.
        statements: 92,
        branches: 87,
        functions: 86,
        lines: 92
      }
    }
  }
})
