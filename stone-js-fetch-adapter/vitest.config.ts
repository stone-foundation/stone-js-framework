import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

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
      // All pure logic, middleware, wiring and the error-dispatch path are covered. The remaining
      // gap is the happy-path of FetchAdapter.eventListener, which requires a full kernel bootstrap
      // (end-to-end harness) — tracked for a follow-up. Kept high and enforced meanwhile.
      thresholds: {
        statements: 98,
        branches: 86,
        functions: 92,
        lines: 98
      },
      watermarks: {
        statements: [80, 100],
        functions: [80, 100],
        branches: [80, 100],
        lines: [80, 100]
      }
    },
  },
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
});
