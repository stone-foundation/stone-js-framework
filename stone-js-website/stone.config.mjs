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
      '/docs/start/first-domain',
      '/docs/start/collapse',
      '/docs/start/anatomy',
      // Docs: Foundations
      '/docs/foundations/continuum',
      '/docs/foundations/domain-context',
      '/docs/foundations/uncertainty',
      '/docs/foundations/superposition',
      '/docs/foundations/ephemeral-context',
      '/docs/foundations/blueprint',
      '/docs/foundations/build-phase',
      '/docs/foundations/lifecycle',
      '/docs/foundations/middleware',
      '/docs/foundations/container',
      '/docs/foundations/providers',
      '/docs/foundations/adapters',
      '/docs/foundations/paradigms',
      '/docs/foundations/forms',
      // Docs: Contexts
      '/docs/contexts/backend',
      '/docs/contexts/frontend',
      '/docs/contexts/edge',
      '/docs/contexts/agents',
      '/docs/contexts/mobile',
      // Docs: Essentials
      '/docs/essentials/application',
      '/docs/essentials/event-handlers',
      '/docs/essentials/incoming-event',
      '/docs/essentials/outgoing-response',
      '/docs/essentials/cookies',
      '/docs/essentials/configuration',
      '/docs/essentials/environment',
      '/docs/essentials/events',
      '/docs/essentials/errors',
      '/docs/essentials/logging',
      '/docs/essentials/hooks',
      // Docs: Extensions
      '/docs/extensions',
      '/docs/extensions/validation',
      '/docs/extensions/auth',
      '/docs/extensions/authorization',
      '/docs/extensions/resources',
      '/docs/extensions/openapi',
      '/docs/extensions/testing',
      '/docs/extensions/mcp',
      '/docs/extensions/telemetry',
      // Docs: Dependency injection
      '/docs/di',
      '/docs/di/services',
      '/docs/di/providers',
      // Docs: Blueprint & build
      '/docs/blueprint',
      '/docs/blueprint/middleware',
      '/docs/blueprint/meta-modules',
      '/docs/blueprint/build',
      // Docs: Middleware (implementation)
      '/docs/middleware',
      '/docs/middleware/defining',
      '/docs/middleware/registering',
      '/docs/middleware/terminating',
      // Docs: Frontend (use-react)
      '/docs/frontend',
      '/docs/frontend/pages',
      '/docs/frontend/layouts',
      '/docs/frontend/components',
      '/docs/frontend/navigation',
      '/docs/frontend/data',
      '/docs/frontend/head',
      '/docs/frontend/error-pages',
      '/docs/frontend/assets',
      '/docs/frontend/rendering',
      '/docs/frontend/use-view',
      // Docs: Adapters (per platform)
      '/docs/adapters',
      '/docs/adapters/node-http',
      '/docs/adapters/node-cli',
      '/docs/adapters/fetch',
      '/docs/adapters/aws-lambda',
      '/docs/adapters/browser',
      '/docs/adapters/mcp',
      '/docs/adapters/mobile',
      // Docs: Routing (dedicated section)
      '/docs/routing',
      '/docs/routing/definitions',
      '/docs/routing/parameters',
      '/docs/routing/query-body',
      '/docs/routing/binding',
      '/docs/routing/groups',
      '/docs/routing/names',
      '/docs/routing/middleware',
      '/docs/routing/redirects',
      '/docs/routing/matching',
      '/docs/routing/misc',
      // Docs: Frontier
      '/docs/frontier/adapter',
      '/docs/frontier/universal',
      '/docs/frontier/agent-native',
      // Docs: Ecosystem
      '/docs/ecosystem',
      // Docs: Reference
      '/docs/reference/api',
      '/docs/reference/cli',
      '/docs/reference/config',
      '/docs/reference/glossary'
    ]
  }
})
