import { createVitestConfig } from '../vitest.config.base.mjs'

export default createVitestConfig(import.meta.url, { coverageExclude: ['src/storage/FileSystem.ts'] })
