import { defineBuilderConfig } from '@stone-js/cli'

/**
 * Pin the rendering strategy to server-side rendering (SSR + client hydration).
 */
export default defineBuilderConfig({
  rendering: 'ssr'
})
