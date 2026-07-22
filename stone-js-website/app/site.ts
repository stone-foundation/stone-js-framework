/**
 * Site-wide values, re-exported from the single source of truth ({@link appConfig} in
 * `AppConfig.ts`, published to the Blueprint by `@Configuration()`). These named exports keep
 * non-component consumers (head builders, the RSS script) working without hook access; components
 * should prefer reading from the Blueprint via `useBlueprint()`.
 */
import { appConfig } from './AppConfig'
import type { HeadContext } from '@stone-js/use-react'

export const GA_MEASUREMENT_ID = appConfig.analytics.ga
export const ALGOLIA = appConfig.algolia
export const GITHUB_URL = appConfig.githubUrl
export const MANIFESTO_URL = appConfig.manifestoUrl
export const SITE_URL = appConfig.siteUrl
export const SITE_NAME = appConfig.name
export const SITE_TAGLINE = appConfig.tagline
export const SITE_DESCRIPTION = appConfig.description

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
