/**
 * Blog article registry: metadata only, plain ESM so it is the single source of
 * truth shared by the TSX pages AND the RSS build script (scripts/build-feed.mjs).
 * Article bodies live in app/blog/content/<slug>.tsx.
 *
 * i18n-ready: every entry carries a `locale` (only 'en' for now). When
 * @stone-js/i18n ships, locale-prefixed slugs/routes can be layered on without a
 * data-model change.
 */

/**
 * @typedef {Object} Article
 * @property {string} slug
 * @property {string} title
 * @property {string} date        ISO date (YYYY-MM-DD)
 * @property {string} author
 * @property {string} excerpt      one/two sentences, for cards + RSS + OG
 * @property {string[]} tags
 * @property {string} [ogImage]    absolute-from-root path to the social card
 * @property {string|null} [starter]  a starters-registry id shipped with this recipe
 * @property {string} locale
 * @property {boolean} [draft]     hidden from listing/feed when true
 */

/** @type {Article[]} */
export const ARTICLES = [
  {
    slug: 'stateless-auth-at-the-edge',
    title: 'Stateless auth at the edge',
    date: '2026-07-22',
    author: 'Evens Pierre',
    excerpt: 'Verify a token at the boundary instead of holding a session, and the same auth guard runs on Node, serverless, the edge and agents, with nothing to store.',
    tags: ['auth', 'edge', 'security'],
    ogImage: '/og/stateless-auth-at-the-edge.png',
    starter: null,
    locale: 'en'
  },
  {
    slug: 'one-domain-three-runtimes',
    title: 'One domain, three runtimes',
    date: '2026-07-21',
    author: 'Evens Pierre',
    excerpt: 'One codebase, unchanged, running on Node, AWS Lambda and the edge. Not three apps: three runtimes. The thing a single-target framework cannot do.',
    tags: ['architecture', 'adapters', 'cloud-native'],
    ogImage: '/og/one-domain-three-runtimes.png',
    starter: 'continuum-showcase',
    locale: 'en'
  },
  {
    slug: 'introducing-stone-js',
    title: 'Introducing Stone.js',
    date: '2026-07-20',
    author: 'Evens Pierre',
    excerpt: 'An application is an act, not an object. Write the domain once; the context applies to it at run time. This is the Continuum, and this is Stone.js.',
    tags: ['architecture', 'continuum'],
    ogImage: '/og/introducing-stone-js.png',
    starter: null,
    locale: 'en'
  },
  {
    slug: 'isomorphic-validation',
    title: 'One schema, validated on the backend and the form',
    date: '2026-07-19',
    author: 'Evens Pierre',
    excerpt: 'Validation duplicated between the API and the UI always drifts. Write the shape once, enforce it at the boundary with a 422, and validate the same schema in the form.',
    tags: ['validation', 'dx'],
    ogImage: '/og/isomorphic-validation.png',
    starter: null,
    locale: 'en'
  },
  {
    slug: 'openapi-from-your-schemas',
    title: 'A public API contract, generated from the schemas you already write',
    date: '2026-07-18',
    author: 'Evens Pierre',
    excerpt: 'A hand-written OpenAPI spec drifts the day after you write it. Derive the document from your validation schemas instead, and serve it with Swagger UI.',
    tags: ['openapi', 'api'],
    ogImage: '/og/openapi-from-your-schemas.png',
    starter: null,
    locale: 'en'
  },
  {
    slug: 'api-as-agent-tools',
    title: 'Your API as MCP tools for agents',
    date: '2026-07-17',
    author: 'Evens Pierre',
    excerpt: 'AI agents are a new kind of caller. Instead of a second API, stack the MCP adapter and the domain that already answers HTTP answers agents as MCP tools.',
    tags: ['agents', 'mcp', 'ai'],
    ogImage: '/og/api-as-agent-tools.png',
    starter: null,
    locale: 'en'
  },
  {
    slug: 'multi-tenant-subdomains',
    title: 'Multi-tenancy with subdomain routing',
    date: '2026-07-16',
    author: 'Evens Pierre',
    excerpt: 'Tenant-per-subdomain without header-parsing plumbing. A subdomain parameter turns multi-tenancy into routing: capture the tenant from the host and read it on the event.',
    tags: ['routing', 'saas', 'multi-tenancy'],
    ogImage: '/og/multi-tenant-subdomains.png',
    starter: null,
    locale: 'en'
  },
  {
    slug: 'signed-url-file-uploads',
    title: 'Direct-to-cloud file uploads with signed URLs',
    date: '2026-07-15',
    author: 'Evens Pierre',
    excerpt: 'Uploading large files without proxying the bytes through your API. Issue a short-lived signed URL, let the client upload straight to storage, then save only the metadata.',
    tags: ['architecture', 'storage', 'cloud-native'],
    ogImage: '/og/signed-url-file-uploads.png',
    starter: null,
    locale: 'en'
  },
  {
    slug: 'real-time-features',
    title: 'Real-time features: live updates and presence',
    date: '2026-07-14',
    author: 'Evens Pierre',
    excerpt: 'Live dashboards, presence and notifications, framed by their architecture: the SSE and WebSocket flow, how a held-open connection fits the per-event model, and where it runs on the edge.',
    tags: ['realtime', 'cloud-native'],
    ogImage: '/og/real-time-features.png',
    starter: null,
    locale: 'en'
  }
]

/** Published (non-draft) articles for the given locale, newest first. */
export function publishedArticles (locale = 'en') {
  return ARTICLES
    .filter((a) => a.draft !== true && a.locale === locale)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

/** Look up one article's metadata by slug. */
export function articleBySlug (slug) {
  return ARTICLES.find((a) => a.slug === slug)
}
