import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Shared Vitest config for @stone-js/* packages.
 *
 * Every package's `vitest.config.ts` is one line: `createVitestConfig(import.meta.url)`, so the
 * common setup (globals, the tests glob, the v8 coverage reporters, watermarks and the `@` -> `src`
 * alias) lives here once instead of being copy-pasted into every module (which SonarCloud flags as
 * duplication). Packages that genuinely differ pass a small options object; the shape is unchanged.
 *
 * `configUrl` is the caller's `import.meta.url`; the `@` alias resolves against that file's own
 * directory, so the base never needs to know where each package lives.
 *
 * @param {string} configUrl - The calling config's `import.meta.url`.
 * @param {object} [options]
 * @param {string} [options.environment='node'] - The test environment (e.g. `'jsdom'` for the view layer).
 * @param {string[]} [options.coverageInclude=['src/**\/*.ts']] - Coverage `include` globs.
 * @param {string[]} [options.coverageExclude] - Coverage `exclude` globs (e.g. pure type-only files).
 * @param {{ statements: number, branches: number, functions: number, lines: number }} [options.thresholds]
 *   - Coverage gates. Defaults to 90 across the board.
 * @returns The Vitest config.
 */
export function createVitestConfig (configUrl, options = {}) {
  const {
    environment = 'node',
    coverageInclude = ['src/**/*.ts'],
    coverageExclude,
    thresholds = { statements: 90, branches: 90, functions: 90, lines: 90 }
  } = options

  const root = dirname(fileURLToPath(configUrl))

  return defineConfig({
    test: {
      globals: true,
      environment,
      include: ['./tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      coverage: {
        provider: 'v8',
        include: coverageInclude,
        ...(coverageExclude !== undefined ? { exclude: coverageExclude } : {}),
        reporter: ['text', 'html', 'lcov'],
        reportsDirectory: './coverage',
        thresholds,
        watermarks: {
          statements: [80, 100],
          functions: [80, 100],
          branches: [80, 100],
          lines: [80, 100]
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(root, 'src')
      }
    }
  })
}
