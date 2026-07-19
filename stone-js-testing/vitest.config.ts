import { resolve } from 'path';
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
      // 100% statements/branches/lines. Functions is 92%: the raw-response wrapper's `respond`
      // is a required-by-type placeholder that is never invoked (the test adapter overrides
      // buildRawResponse to return the outgoing response directly). Kept high and enforced.
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 92,
        lines: 100
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
