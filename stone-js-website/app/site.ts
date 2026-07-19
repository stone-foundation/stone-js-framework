/**
 * Site-wide constants: analytics and search credentials, carried over from the
 * previous documentation site. The Algolia API key is the search-only key and is
 * safe to ship to the client; the GA id is public by design.
 */

export const GA_MEASUREMENT_ID = 'G-F368Y4JRZR'

export const ALGOLIA = {
  appId: 'B8ZTXIHIAP',
  apiKey: '65a6a180473de963344f97d15302da4d',
  indexName: 'stonejs'
} as const

export const GITHUB_URL = 'https://github.com/stone-foundation'
export const MANIFESTO_URL = 'https://evens-stone.github.io/continuum-manifesto/manifesto'
