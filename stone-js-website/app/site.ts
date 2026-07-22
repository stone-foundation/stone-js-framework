/**
 * Site-wide constants: analytics and search credentials, carried over from the
 * previous documentation site. The Algolia API key is the search-only key and is
 * safe to ship to the client; the GA id is public by design.
 */
import type { HeadContext } from '@stone-js/use-react'

export const GA_MEASUREMENT_ID = 'G-F368Y4JRZR'

export const ALGOLIA = {
  appId: 'B8ZTXIHIAP',
  apiKey: '65a6a180473de963344f97d15302da4d',
  indexName: 'stonejs'
} as const

export const GITHUB_URL = 'https://github.com/stone-foundation'
export const MANIFESTO_URL = 'https://evens-stone.github.io/continuum-manifesto/manifesto'

/** Canonical site origin (see public/CNAME). Used for absolute share/OG/RSS URLs. */
export const SITE_URL = 'https://stonejs.dev'

export const SITE_NAME = 'Stone.js'
export const SITE_TAGLINE = 'The Continuum framework'
export const SITE_DESCRIPTION = 'Write your domain once; it runs in every context: server, edge, browser, agents.'

/** The brand social card shipped when a page declares none of its own. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.jpg`

/**
 * The brand-default head (Open Graph + Twitter card). Layouts return this from their `head()`;
 * the framework merges it under each page's own head, so a page overrides any field simply by
 * declaring it (page wins on conflict). Pages without a layout (e.g. the landing page) spread
 * these metas into their own head directly.
 */
export function defaultSocialHead (): HeadContext {
  const fullTitle = `${SITE_NAME} · ${SITE_TAGLINE}`
  return {
    metas: [
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:image', content: DEFAULT_OG_IMAGE },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: SITE_DESCRIPTION },
      { name: 'twitter:image', content: DEFAULT_OG_IMAGE }
    ]
  }
}
