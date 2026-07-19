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
      // 100% statements/lines. Branches/functions kept high and enforced: the remaining gap is
      // the raw-response wrapper's `respond` placeholder (never invoked — buildRawResponse is
      // overridden) and a default-transport branch. Full run()/dispatch is covered via a mocked SDK.
      thresholds: {
        statements: 100,
        branches: 92,
        functions: 93,
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
