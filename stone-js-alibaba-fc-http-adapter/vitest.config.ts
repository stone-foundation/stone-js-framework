import { createVitestConfig } from '../vitest.config.base.mjs'

export default createVitestConfig(import.meta.url, { thresholds: { statements: 98, branches: 86, functions: 92, lines: 98 } })
