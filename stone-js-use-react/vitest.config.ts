import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['./tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        // View layer: 100% elsewhere in the framework. The remaining gap is deferred/edge
        // view-engine code (lazy loading, streaming/SSG paths) — tracked for a follow-up test
        // pass. Kept high and enforced meanwhile.
        statements: 97,
        branches: 97,
        functions: 97,
        lines: 97
      },
      watermarks: {
        statements: [80, 100],
        functions: [80, 100],
        branches: [80, 100],
        lines: [80, 100]
      }
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
