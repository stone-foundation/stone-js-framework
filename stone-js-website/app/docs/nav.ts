/**
 * The documentation tree: the single source of truth for the whole site map.
 *
 * It drives the sidebar, the prev/next pager and (later) breadcrumbs and search.
 * The full outline is listed here so the shape is always visible; pages not yet
 * written are marked `soon` and render as disabled, never as dead links. Flip
 * `soon` off the moment a page ships.
 */

export interface DocLink {
  title: string
  path: string
  /** Not built yet: shown greyed in the sidebar, excluded from routing and the pager. */
  soon?: boolean
}

export interface DocSection {
  title: string
  /** One-line intent, shown under the section title in the sidebar. */
  blurb: string
  items: DocLink[]
}

export const DOC_NAV: DocSection[] = [
  {
    title: 'Start here',
    blurb: 'From zero to your first collapse.',
    items: [
      { title: 'Why Stone.js', path: '/docs' },
      { title: 'Install & create', path: '/docs/start/install' },
      { title: 'Your first domain', path: '/docs/start/first-domain', soon: true },
      { title: 'Collapse it', path: '/docs/start/collapse', soon: true },
      { title: 'Project anatomy', path: '/docs/start/anatomy', soon: true }
    ]
  },
  {
    title: 'Foundations',
    blurb: 'The ideas that hold in every context.',
    items: [
      { title: 'The Continuum', path: '/docs/foundations/continuum' },
      { title: 'Domain × Context → Resolution', path: '/docs/foundations/domain-context' },
      { title: 'The uncertainty principle', path: '/docs/foundations/uncertainty' },
      { title: 'Superposition & collapse', path: '/docs/foundations/superposition', soon: true },
      { title: 'The ephemeral context', path: '/docs/foundations/ephemeral-context', soon: true },
      { title: 'Blueprint: config as a manifest', path: '/docs/foundations/blueprint', soon: true },
      { title: 'Blueprint as a pipeline', path: '/docs/foundations/build-phase', soon: true },
      { title: 'Lifecycle & the kernel', path: '/docs/foundations/lifecycle', soon: true },
      { title: 'Middleware & the pipeline', path: '/docs/foundations/middleware', soon: true },
      { title: 'Service container & DI', path: '/docs/foundations/container', soon: true },
      { title: 'Service providers', path: '/docs/foundations/providers', soon: true },
      { title: 'Adapters', path: '/docs/foundations/adapters', soon: true },
      { title: 'The two paradigms', path: '/docs/foundations/paradigms', soon: true },
      { title: 'The three forms', path: '/docs/foundations/forms', soon: true }
    ]
  },
  {
    title: 'Contexts',
    blurb: 'The dimensions. The same domain, collapsed differently.',
    items: [
      { title: 'Backend', path: '/docs/contexts/backend' },
      { title: 'Frontend', path: '/docs/contexts/frontend' },
      { title: 'Edge & Serverless', path: '/docs/contexts/edge' },
      { title: 'Agents', path: '/docs/contexts/agents' },
      { title: 'Mobile', path: '/docs/contexts/mobile', soon: true }
    ]
  },
  {
    title: 'Build',
    blurb: 'Recipes for real applications.',
    items: [
      { title: 'Config & environment', path: '/docs/build/config' },
      { title: 'Routing', path: '/docs/build/routing' },
      { title: 'Validation', path: '/docs/build/validation' },
      { title: 'Auth & authorization', path: '/docs/build/auth' },
      { title: 'Resources & OpenAPI', path: '/docs/build/resources' },
      { title: 'Testing', path: '/docs/build/testing' }
    ]
  },
  {
    title: 'Frontier',
    blurb: 'Bring the future to your stack.',
    items: [
      { title: 'Write your own adapter', path: '/docs/frontier/adapter' },
      { title: 'Universal apps', path: '/docs/frontier/universal' },
      { title: 'Agent-native patterns', path: '/docs/frontier/agent-native' }
    ]
  },
  {
    title: 'Ecosystem',
    blurb: 'A keystone kernel. Everything else plugs in.',
    items: [
      { title: 'Marketplace', path: '/docs/ecosystem' }
    ]
  }
]

/** Every real (built) page, in reading order: the spine of the prev/next pager. */
export const DOC_SPINE: DocLink[] = DOC_NAV
  .flatMap((section) => section.items)
  .filter((item) => item.soon !== true)

/** All routable doc paths (built pages only), for the SSG route list. */
export const DOC_ROUTES: string[] = DOC_SPINE.map((item) => item.path)

/** The previous and next built pages around a given path. */
export function siblings (path: string): { prev?: DocLink, next?: DocLink } {
  const index = DOC_SPINE.findIndex((item) => item.path === path)
  if (index === -1) return {}
  return { prev: DOC_SPINE[index - 1], next: DOC_SPINE[index + 1] }
}
