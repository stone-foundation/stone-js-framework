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
