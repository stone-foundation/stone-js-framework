import { defineBuilderConfig } from '@stone-js/cli'

/**
 * Pin the rendering strategy to static site generation and list the routes to pre-render.
 */
export default defineBuilderConfig({
  rendering: 'ssg',
  ssg: {
    routes: ['/', '/about']
  }
})
