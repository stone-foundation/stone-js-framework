import { defineConfig } from '@stone-js/cli'

/**
 * Stone build configuration.
 */
export default defineConfig({
  dotenv: {
    private: {
      path: ['.env', '.env.public'],
    }
  }
})
