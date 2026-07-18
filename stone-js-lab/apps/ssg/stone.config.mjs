import { defineConfig } from '@stone-js/cli'

/**
 * Pin the rendering strategy to static site generation and list the routes to pre-render.
 * Parameterized routes must be listed explicitly.
 */
export default defineConfig({
  rendering: 'ssg',
  ssg: {
    routes: ['/', '/about']
  }
})
