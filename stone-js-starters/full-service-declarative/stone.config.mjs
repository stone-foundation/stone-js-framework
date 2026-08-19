import { defineBuilderConfig } from '@stone-js/cli'

/**
 * Stone build configuration.
 */
export default defineBuilderConfig({
  rollup: {
    bundle: {
      external: ['@libsql/client'],
    }
  }
})
