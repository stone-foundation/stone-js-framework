/**
 * Head/meta management API for React pages, re-exported from the agnostic
 * `@stone-js/use-view` layer so users import everything from `@stone-js/use-react`.
 *
 * ```tsx
 * import { createHead } from '@stone-js/use-react'
 *
 * class BlogPost implements IPage<ReactIncomingEvent> {
 *   head ({ data }) {
 *     return createHead()
 *       .title(data.post.title)
 *       .titleTemplate('%s — Stone.js')
 *       .description(data.post.excerpt)
 *       .canonical(`https://stonejs.dev/blog/${data.post.slug}`)
 *       .og({ type: 'article', image: data.post.cover, siteName: 'Stone.js' })
 *       .twitter({ card: 'summary_large_image', site: '@stonejs' })
 *       .jsonLd({ '@context': 'https://schema.org', '@type': 'Article', headline: data.post.title })
 *       .toContext()
 *   }
 *   render ({ data }) { return <article>{data.post.body}</article> }
 * }
 * ```
 */
export {
  HeadManager,
  createHead,
  defineHead,
  // Agnostic head application (client DOM + SSR HTML string), ported to `@stone-js/use-view`
  // and re-exported here so `@stone-js/use-react` users keep a single import surface.
  applyMeta,
  applyLink,
  applyStyle,
  applyScript,
  applyJsonLd,
  STONE_HEAD_ATTR,
  applyHeadToHtml,
  applyHeadToDocument,
  applyElementAttributes
} from '@stone-js/use-view'

// Note: `HeadContext` and the descriptor types are re-exported from `./declarations`
// (single source) to avoid a duplicate re-export in the multi-entry bundle.
export type {
  OpenGraphOptions,
  TwitterOptions,
  RobotsOptions
} from '@stone-js/use-view'
