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

/** A named cluster of pages inside a section (a sub-section). */
export interface DocGroup {
  title: string
  items: DocLink[]
}

export interface DocSection {
  title: string
  /** One-line intent, shown under the section title in the sidebar. */
  blurb: string
  /** Flat pages directly under the section. */
  items?: DocLink[]
  /** Sub-sections; rendered as labelled groups under the section. */
  groups?: DocGroup[]
}

export const DOC_NAV: DocSection[] = [
  {
    title: 'Start here',
    blurb: 'From zero to your first collapse.',
    items: [
      { title: 'Why Stone.js', path: '/docs' },
      { title: 'Install & create', path: '/docs/start/install' },
      { title: 'Your first domain', path: '/docs/start/first-domain' },
      { title: 'Collapse it', path: '/docs/start/collapse' },
      { title: 'Project anatomy', path: '/docs/start/anatomy' }
    ]
  },
  {
    title: 'Foundations',
    blurb: 'The ideas that hold in every context.',
    items: [
      { title: 'The Continuum', path: '/docs/foundations/continuum' },
      { title: 'Domain × Context → Resolution', path: '/docs/foundations/domain-context' },
      { title: 'The uncertainty principle', path: '/docs/foundations/uncertainty' },
      { title: 'Superposition & collapse', path: '/docs/foundations/superposition' },
      { title: 'The ephemeral context', path: '/docs/foundations/ephemeral-context' },
      { title: 'Blueprint: config as a manifest', path: '/docs/foundations/blueprint' },
      { title: 'Blueprint as a pipeline', path: '/docs/foundations/build-phase' },
      { title: 'Lifecycle & the kernel', path: '/docs/foundations/lifecycle' },
      { title: 'Middleware & the pipeline', path: '/docs/foundations/middleware' },
      { title: 'Service container & DI', path: '/docs/foundations/container' },
      { title: 'Service providers', path: '/docs/foundations/providers' },
      { title: 'Adapters', path: '/docs/foundations/adapters' },
      { title: 'The two paradigms', path: '/docs/foundations/paradigms' },
      { title: 'The three forms', path: '/docs/foundations/forms' }
    ]
  },
  {
    title: 'Essentials',
    blurb: 'The runtime building blocks, in detail.',
    items: [
      { title: 'Application & bootstrap', path: '/docs/essentials/application' },
      { title: 'Event handlers', path: '/docs/essentials/event-handlers' },
      { title: 'Incoming event', path: '/docs/essentials/incoming-event' },
      { title: 'Outgoing response', path: '/docs/essentials/outgoing-response' },
      { title: 'Cookies', path: '/docs/essentials/cookies' },
      { title: 'Filesystem & storage', path: '/docs/essentials/filesystem' },
      { title: 'Configuration', path: '/docs/essentials/configuration' },
      { title: 'Environment', path: '/docs/essentials/environment' },
      { title: 'Events & listeners', path: '/docs/essentials/events' },
      { title: 'Error handling', path: '/docs/essentials/errors' },
      { title: 'Logging', path: '/docs/essentials/logging' },
      { title: 'Hooks & lifecycle', path: '/docs/essentials/hooks' }
    ]
  },
  {
    title: 'Dependency injection',
    blurb: 'Declare what you need; the container provides it.',
    items: [
      { title: 'The container', path: '/docs/di' },
      { title: 'Services', path: '/docs/di/services' },
      { title: 'Service providers', path: '/docs/di/providers' }
    ]
  },
  {
    title: 'Blueprint & build',
    blurb: 'How the manifest is composed and built.',
    items: [
      { title: 'The Blueprint', path: '/docs/blueprint' },
      { title: 'Blueprint middleware', path: '/docs/blueprint/middleware' },
      { title: 'Meta-modules & define*', path: '/docs/blueprint/meta-modules' },
      { title: 'The build & targets', path: '/docs/blueprint/build' }
    ]
  },
  {
    title: 'Middleware',
    blurb: 'The pipeline every event flows through.',
    items: [
      { title: 'Overview', path: '/docs/middleware' },
      { title: 'Defining middleware', path: '/docs/middleware/defining' },
      { title: 'Registering middleware', path: '/docs/middleware/registering' },
      { title: 'Terminating middleware', path: '/docs/middleware/terminating' }
    ]
  },
  {
    title: 'Frontend',
    blurb: 'React on the universal kernel: pages, views, rendering.',
    items: [
      { title: 'Overview', path: '/docs/frontend' },
      { title: 'Pages', path: '/docs/frontend/pages' },
      { title: 'Layouts', path: '/docs/frontend/layouts' },
      { title: 'Components & links', path: '/docs/frontend/components' },
      { title: 'Navigation', path: '/docs/frontend/navigation' },
      { title: 'Data fetching', path: '/docs/frontend/data' },
      { title: 'Head & metadata', path: '/docs/frontend/head' },
      { title: 'Error pages', path: '/docs/frontend/error-pages' },
      { title: 'Assets', path: '/docs/frontend/assets' },
      { title: 'Rendering: CSR, SSR, SSG', path: '/docs/frontend/rendering' },
      { title: 'use-view', path: '/docs/frontend/use-view' }
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
      { title: 'Mobile', path: '/docs/contexts/mobile' }
    ]
  },
  {
    title: 'Adapters',
    blurb: 'Each platform, A to Z: install, enable, configure, deploy.',
    items: [
      { title: 'Overview', path: '/docs/adapters' },
      { title: 'Node HTTP', path: '/docs/adapters/node-http' },
      { title: 'Node CLI', path: '/docs/adapters/node-cli' },
      { title: 'Fetch (edge & serverless)', path: '/docs/adapters/fetch' },
      { title: 'AWS Lambda', path: '/docs/adapters/aws-lambda' },
      { title: 'GCP Cloud Functions', path: '/docs/adapters/gcp-cloud-functions' },
      { title: 'Azure Functions', path: '/docs/adapters/azure-functions' },
      { title: 'Alibaba Cloud FC', path: '/docs/adapters/alibaba-fc' },
      { title: 'Browser', path: '/docs/adapters/browser' },
      { title: 'MCP (agents)', path: '/docs/adapters/mcp' },
      { title: 'Mobile', path: '/docs/adapters/mobile' }
    ]
  },
  {
    title: 'Extensions',
    blurb: 'Opt-in capabilities that graft onto the kernel.',
    items: [
      { title: 'Overview', path: '/docs/extensions' },
      { title: 'Validation', path: '/docs/extensions/validation' },
      { title: 'Auth', path: '/docs/extensions/auth' },
      { title: 'Authorization', path: '/docs/extensions/authorization' },
      { title: 'Resources', path: '/docs/extensions/resources' },
      { title: 'OpenAPI', path: '/docs/extensions/openapi' },
      { title: 'Testing', path: '/docs/extensions/testing' },
      { title: 'MCP server & llms.txt', path: '/docs/extensions/mcp' },
      { title: 'Telemetry', path: '/docs/extensions/telemetry' }
    ]
  },
  {
    title: 'Routing',
    blurb: 'One universal router, in full.',
    items: [
      { title: 'Overview', path: '/docs/routing' },
      { title: 'Route definitions', path: '/docs/routing/definitions' },
      { title: 'Parameters & constraints', path: '/docs/routing/parameters' },
      { title: 'Query & body', path: '/docs/routing/query-body' },
      { title: 'Model binding', path: '/docs/routing/binding' },
      { title: 'Groups & prefixes', path: '/docs/routing/groups' },
      { title: 'Named routes & URL generation', path: '/docs/routing/names' },
      { title: 'Route middleware', path: '/docs/routing/middleware' },
      { title: 'Redirects & responses', path: '/docs/routing/redirects' },
      { title: 'Matching & precedence', path: '/docs/routing/matching' },
      { title: 'Misc', path: '/docs/routing/misc' }
    ]
  },
  {
    title: 'Extending Stone.js',
    blurb: 'Author the framework’s own building blocks.',
    items: [
      { title: 'Overview', path: '/docs/extending' },
      { title: 'Write your own adapter', path: '/docs/extending/adapter' },
      { title: 'Create a package or plugin', path: '/docs/extending/package' },
      { title: 'Create a decorator', path: '/docs/extending/decorator' },
      { title: 'Create CLI commands', path: '/docs/extending/commands' }
    ]
  },
  {
    title: 'Primitives',
    blurb: 'The three libraries the kernel is built on.',
    items: [
      { title: 'Overview', path: '/docs/primitives' },
      { title: 'Pipeline', path: '/docs/primitives/pipeline' },
      { title: 'Service container', path: '/docs/primitives/service-container' },
      { title: 'Config', path: '/docs/primitives/config' }
    ]
  },
  {
    title: 'Frontier',
    blurb: 'Bring the future to your stack.',
    items: [
      { title: 'Universal apps', path: '/docs/frontier/universal' },
      { title: 'Agent-native patterns', path: '/docs/frontier/agent-native' },
      { title: 'Performance & cold starts', path: '/docs/frontier/performance' },
      { title: 'Security posture', path: '/docs/frontier/security' },
      { title: 'Internals', path: '/docs/frontier/internals' }
    ]
  },
  {
    title: 'Ecosystem',
    blurb: 'A keystone kernel. Everything else plugs in.',
    items: [
      { title: 'Marketplace', path: '/docs/ecosystem' }
    ]
  },
  {
    title: 'Reference',
    blurb: 'Look it up.',
    items: [
      { title: 'API', path: '/docs/reference/api' },
      { title: 'CLI', path: '/docs/reference/cli' },
      { title: 'Configuration', path: '/docs/reference/config' },
      { title: 'Glossary', path: '/docs/reference/glossary' }
    ]
  }
]

/** Every page of a section, flat, in order (its own items then each group's). */
export function sectionLinks (section: DocSection): DocLink[] {
  return [
    ...(section.items ?? []),
    ...(section.groups ?? []).flatMap((group) => group.items)
  ]
}

/** Every real (built) page, in reading order: the spine of the prev/next pager. */
export const DOC_SPINE: DocLink[] = DOC_NAV
  .flatMap(sectionLinks)
  .filter((item) => item.soon !== true)

/** All routable doc paths (built pages only), for the SSG route list. */
export const DOC_ROUTES: string[] = DOC_SPINE.map((item) => item.path)

/** The previous and next built pages around a given path. */
export function siblings (path: string): { prev?: DocLink, next?: DocLink } {
  const index = DOC_SPINE.findIndex((item) => item.path === path)
  if (index === -1) return {}
  return { prev: DOC_SPINE[index - 1], next: DOC_SPINE[index + 1] }
}

/** Where a path sits in the tree: its section, its group (if any), and the link. */
export interface Located { section: DocSection, group?: DocGroup, link: DocLink }

export function locate (path: string): Located | undefined {
  for (const section of DOC_NAV) {
    for (const link of section.items ?? []) {
      if (link.path === path) return { section, link }
    }
    for (const group of section.groups ?? []) {
      for (const link of group.items) {
        if (link.path === path) return { section, group, link }
      }
    }
  }
  return undefined
}

/** True when a section contains the given path (in its items or any group). */
export function sectionHasPath (section: DocSection, path: string): boolean {
  return sectionLinks(section).some((link) => link.path === path)
}
