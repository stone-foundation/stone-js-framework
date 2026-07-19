import { defineConfig } from '@stone-js/cli'

/**
 * The website pre-renders to static HTML (SSG) and hydrates in the browser.
 * Routes are listed explicitly; new pages must be added here.
 */
export default defineConfig({
  rendering: 'ssg',
  ssg: {
    routes: ['/']
  }
})
