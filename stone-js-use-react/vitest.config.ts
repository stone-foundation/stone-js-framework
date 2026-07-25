import { createVitestConfig } from '../vitest.config.base.mjs'

export default createVitestConfig(import.meta.url, { environment: 'jsdom', coverageInclude: ['src/**/*.ts', 'src/**/*.tsx'], thresholds: { statements: 97, branches: 97, functions: 97, lines: 97 } })
