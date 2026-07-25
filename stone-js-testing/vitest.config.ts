import { createVitestConfig } from '../vitest.config.base.mjs'

export default createVitestConfig(import.meta.url, { thresholds: { statements: 100, branches: 100, functions: 92, lines: 100 } })
