import { createVitestConfig } from '../vitest.config.base.mjs'

export default createVitestConfig(import.meta.url, { thresholds: { statements: 92, branches: 87, functions: 86, lines: 92 } })
