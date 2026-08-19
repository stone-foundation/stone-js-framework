import { defineBuilderConfig } from '@stone-js/cli'

/**
 * Stone build configuration.
 */
export default defineBuilderConfig({
  dotenv: {
    private: {
      path: ['.env', '.env.public'],
    }
  }
})
