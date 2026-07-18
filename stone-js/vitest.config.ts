import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['./tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8',
      include: ['bin/*.mjs'],
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        100: true
      },
      watermarks: {
        statements: [80, 100],
        functions: [80, 100],
        branches: [80, 100],
        lines: [80, 100]
      }
    },
  },
});
