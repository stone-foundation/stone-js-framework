import { describe, it, expect } from 'vitest'
import { createHead, defineHead, HeadManager } from '../src/head-manager'
import { serializeHead } from '../src/head'

describe('HeadManager — basic meta', () => {
  it('builds title, description, canonical, viewport, charset', () => {
    const ctx = createHead()
      .charset()
      .viewport()
      .title('Home')
      .description('Welcome')
      .canonical('https://stonejs.dev/')
      .toContext()

    expect(ctx.title).toBe('Home')
    expect(ctx.description).toBe('Welcome')
    expect(ctx.metas).toContainEqual({ charset: 'utf-8' })
    expect(ctx.metas).toContainEqual({ name: 'viewport', content: 'width=device-width, initial-scale=1' })
    expect(ctx.links).toContainEqual({ rel: 'canonical', href: 'https://stonejs.dev/' })
  })

  it('applies a title template', () => {
    const ctx = createHead().title('Blog').titleTemplate('%s — Stone.js').toContext()
    expect(ctx.title).toBe('Blog — Stone.js')
    expect(ctx.titleTemplate).toBeUndefined()
  })

  it('dedupes metas by name/property (last wins)', () => {
    const ctx = createHead()
      .meta({ name: 'robots', content: 'index' })
      .meta({ name: 'robots', content: 'noindex' })
      .toContext()
    const robots = ctx.metas?.filter((m) => m.name === 'robots') ?? []
    expect(robots).toHaveLength(1)
    expect(robots[0].content).toBe('noindex')
  })
})

describe('HeadManager — Open Graph', () => {
  it('emits og:* property metas and falls back to title/description', () => {
    const ctx = createHead()
      .title('Post')
      .description('An article')
      .og({ type: 'article', url: 'https://x/p', siteName: 'Stone.js' })
      .toContext()

    expect(ctx.metas).toContainEqual({ property: 'og:title', content: 'Post' })
    expect(ctx.metas).toContainEqual({ property: 'og:description', content: 'An article' })
    expect(ctx.metas).toContainEqual({ property: 'og:type', content: 'article' })
    expect(ctx.metas).toContainEqual({ property: 'og:site_name', content: 'Stone.js' })
  })

  it('expands a structured og image', () => {
    const ctx = createHead()
      .og({ image: { url: 'https://x/c.png', width: 1200, height: 630, alt: 'Cover' } })
      .toContext()

    expect(ctx.metas).toContainEqual({ property: 'og:image', content: 'https://x/c.png' })
    expect(ctx.metas).toContainEqual({ property: 'og:image:width', content: '1200' })
    expect(ctx.metas).toContainEqual({ property: 'og:image:height', content: '630' })
    expect(ctx.metas).toContainEqual({ property: 'og:image:alt', content: 'Cover' })
  })
})

describe('HeadManager — Twitter, robots, jsonLd', () => {
  it('emits twitter:* name metas', () => {
    const ctx = createHead()
      .title('T')
      .twitter({ card: 'summary_large_image', site: '@stonejs', image: 'https://x/i.png' })
      .toContext()

    expect(ctx.metas).toContainEqual({ name: 'twitter:card', content: 'summary_large_image' })
    expect(ctx.metas).toContainEqual({ name: 'twitter:site', content: '@stonejs' })
    expect(ctx.metas).toContainEqual({ name: 'twitter:title', content: 'T' })
    expect(ctx.metas).toContainEqual({ name: 'twitter:image', content: 'https://x/i.png' })
  })

  it('serializes robots directives', () => {
    const ctx = createHead().robots({ index: true, follow: false, maxImagePreview: 'large' }).toContext()
    expect(ctx.metas).toContainEqual({ name: 'robots', content: 'index, nofollow, max-image-preview:large' })
  })

  it('collects jsonLd blocks', () => {
    const ctx = createHead()
      .jsonLd({ '@type': 'Article', headline: 'H' })
      .toContext()
    expect(ctx.jsonLd).toEqual([{ '@type': 'Article', headline: 'H' }])
  })
})

describe('HeadManager — merge (hierarchical heads)', () => {
  it('merges layout head with page head, page wins on scalars, metas dedupe', () => {
    const layout = createHead().title('Site').meta({ name: 'theme-color', content: '#000' })
    const page = createHead().title('Page').og({ type: 'website' })

    const ctx = layout.merge(page).toContext()

    expect(ctx.title).toBe('Page')
    expect(ctx.metas).toContainEqual({ name: 'theme-color', content: '#000' })
    expect(ctx.metas).toContainEqual({ property: 'og:type', content: 'website' })
  })

  it('accepts a plain HeadContext in merge', () => {
    const ctx = createHead().merge({ title: 'X', metas: [{ name: 'a', content: 'b' }] }).toContext()
    expect(ctx.title).toBe('X')
    expect(ctx.metas).toContainEqual({ name: 'a', content: 'b' })
  })
})

describe('HeadManager — serialization integration', () => {
  it('produces SSR-safe HTML including og, jsonLd, base', () => {
    const ctx = createHead()
      .title('Post')
      .base('/app/')
      .og({ type: 'article', image: 'https://x/c.png' })
      .jsonLd({ '@context': 'https://schema.org', '@type': 'Article', headline: '</script>' })
      .toContext()

    const html = serializeHead(ctx)

    expect(html).toContain('<title>Post</title>')
    expect(html).toContain('<base href="/app/">')
    expect(html).toContain('<meta property="og:type" content="article">')
    expect(html).toContain('application/ld+json')
    // JSON-LD payload cannot break out of the script tag.
    expect(html.match(/<\/script>/g)).toHaveLength(1)
  })
})

describe('defineHead (imperative parity)', () => {
  it('returns the head context as-is', () => {
    const ctx = { title: 'X' }
    expect(defineHead(ctx)).toBe(ctx)
  })
})

describe('HeadManager class', () => {
  it('is constructible directly and seeded from an initial context', () => {
    const mgr = new HeadManager({ title: 'seed' })
    expect(mgr.toContext().title).toBe('seed')
  })
})
