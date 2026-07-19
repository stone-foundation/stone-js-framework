import { defineConfig } from '@stone-js/cli'

/**
 * The website pre-renders to static HTML (SSG) and hydrates in the browser.
 * Keep this list in sync with the built pages in app/docs/nav.ts (DOC_ROUTES)
 * as new docs pages ship.
 */
export default defineConfig({
  rendering: 'ssg',
  ssg: {
    routes: [
      '/',
      // Docs: Start here
      '/docs',
      '/docs/start/install',
      // Docs: Foundations
      '/docs/foundations/continuum',
      '/docs/foundations/domain-context',
      '/docs/foundations/uncertainty',
      // Docs: Contexts
      '/docs/contexts/backend',
      '/docs/contexts/frontend',
      '/docs/contexts/edge',
      '/docs/contexts/agents'
    ]
  }
})
