import { defineBuilderConfig } from '@stone-js/cli'

/**
 * Pin the rendering strategy to client-side rendering (SPA).
 */
export default defineBuilderConfig({
  rendering: 'csr'
})
