import { defineConfig } from '@stone-js/cli'

/**
 * Pin the rendering strategy to static site generation and list the routes to pre-render.
 */
export default defineConfig({
  rendering: 'ssg',
  ssg: {
    routes: ['/', '/about']
  }
})
