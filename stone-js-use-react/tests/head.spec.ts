import { describe, it, expect } from 'vitest'
import { createHead, defineHead, applyHeadToHtml, applyHeadToDocument } from '../src/head'

const TEMPLATE = '<!DOCTYPE html><html><head><title></title>\n<!--app-head--></head><body></body></html>'

describe('use-react head API (re-exported from use-view)', () => {
  it('exposes createHead and defineHead', () => {
    expect(typeof createHead).toBe('function')
    expect(defineHead({ title: 'X' })).toEqual({ title: 'X' })
  })
})

describe('applyHeadToHtml with createHead (SSR)', () => {
  it('renders title, OG, canonical and JSON-LD from a fluent head', () => {
    const head = createHead()
      .title('My Post')
      .titleTemplate('%s — Stone.js')
      .description('An article')
      .canonical('https://stonejs.dev/p')
      .og({ type: 'article', image: { url: 'https://x/c.png', width: 1200, height: 630 } })
      .twitter({ card: 'summary_large_image', site: '@stonejs' })
      .jsonLd({ '@context': 'https://schema.org', '@type': 'Article', headline: 'My Post' })
      .toContext()

    const html = applyHeadToHtml(head, TEMPLATE)

    expect(html).toContain('<title>My Post — Stone.js</title>')
    expect(html).toContain('<meta property="og:type" content="article">')
    expect(html).toContain('<meta property="og:image" content="https://x/c.png">')
    expect(html).toContain('<meta property="og:image:width" content="1200">')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">')
    expect(html).toContain('<link rel="canonical" href="https://stonejs.dev/p">')
    expect(html).toContain('application/ld+json')
    // JSON-LD cannot break out of its script tag.
    expect(html.match(/<\/script>/g)).toHaveLength(1)
  })

  it('inserts a title containing $ literally (no String.replace pattern corruption)', () => {
    const head = createHead().title("Price: $& and $'").toContext()
    const html = applyHeadToHtml(head, TEMPLATE)
    expect(html).toContain("<title>Price: $&amp; and $&#39;</title>")
  })

  it('applies html/body attributes', () => {
    const head = createHead().htmlAttributes({ lang: 'en' }).bodyAttributes({ class: 'app' }).toContext()
    const html = applyHeadToHtml(head, TEMPLATE)
    expect(html).toContain('<html lang="en">')
    expect(html).toContain('<body class="app">')
  })
})

describe('applyHeadToDocument with createHead (CSR)', () => {
  it('applies title, metas, canonical and JSON-LD to the document', () => {
    document.head.innerHTML = ''
    document.title = ''

    const head = createHead()
      .title('Home')
      .og({ type: 'website' })
      .canonical('https://stonejs.dev/')
      .jsonLd({ '@type': 'WebSite' })
      .toContext()

    applyHeadToDocument(document, head)

    expect(document.title).toBe('Home')
    expect(document.head.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('website')
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://stonejs.dev/')
    expect(document.head.querySelector('script[type="application/ld+json"]')?.textContent).toContain('WebSite')
  })
})
