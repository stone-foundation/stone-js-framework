import { defineConfig } from '@stone-js/cli'

/**
 * Stone build configuration.
 */
export default defineConfig({
  rollup: {
    bundle: {
      external: ['@libsql/client'],
    }
  }
})
