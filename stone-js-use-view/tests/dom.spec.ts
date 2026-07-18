// @vitest-environment jsdom

import { applyHeadToDocument, applyHeadToHtml, STONE_HEAD_ATTR } from '../src/dom'

const createTestDocument = (): Document => {
  return globalThis.document.implementation.createHTMLDocument('TestDoc')
}

describe('dom head application', () => {
  let doc: Document

  beforeEach(() => {
    doc = createTestDocument()
  })

  describe('applyHeadToDocument (CSR)', () => {
    it('sets title and description meta', () => {
      applyHeadToDocument(doc, { title: 'My Title', description: 'My desc' })

      expect(doc.title).toBe('My Title')
      const meta = doc.head.querySelector('meta[name="description"]')
      expect(meta?.getAttribute('content')).toBe('My desc')
      expect(meta?.hasAttribute(STONE_HEAD_ATTR)).toBe(true)
    })

    it('applies a title template', () => {
      applyHeadToDocument(doc, { title: 'Home', titleTemplate: '%s — Stone.js' })
      expect(doc.title).toBe('Home — Stone.js')
    })

    it('applies meta and updates content if different', () => {
      applyHeadToDocument(doc, { metas: [{ name: 'viewport', content: 'initial-scale=1.0' }] })
      const el: any = doc.head.querySelector('meta[name="viewport"]')
      expect(el?.content).toBe('initial-scale=1.0')

      applyHeadToDocument(doc, { metas: [{ name: 'viewport', content: 'width=device-width' }] })
      expect(el?.content).toBe('width=device-width')
    })

    it('applies <link> tag and updates if needed', () => {
      applyHeadToDocument(doc, { links: [{ rel: 'stylesheet', href: '/style.css' }] })
      const el = doc.head.querySelector('link[rel="stylesheet"]')
      expect(el?.getAttribute('href')).toBe('/style.css')
      expect(el?.hasAttribute(STONE_HEAD_ATTR)).toBe(true)
    })

    it('updates existing link tag when attribute changes', () => {
      applyHeadToDocument(doc, { links: [{ rel: 'icon', href: '/favicon.ico', type: 'image/png' }] })
      const el = doc.head.querySelector('link[href="/favicon.ico"]')
      expect(el?.getAttribute('type')).toBe('image/png')

      applyHeadToDocument(doc, { links: [{ rel: 'icon', href: '/favicon.ico', type: 'image/svg+xml' }] })
      expect(el?.getAttribute('type')).toBe('image/svg+xml')
    })

    it('applies <script> tag with boolean attributes', () => {
      applyHeadToDocument(doc, { scripts: [{ src: '/app.js', async: true }] })
      const el = doc.head.querySelector('script[src="/app.js"]')
      expect(el?.hasAttribute('async')).toBe(true)
      expect(el?.hasAttribute(STONE_HEAD_ATTR)).toBe(true)
    })

    it('updates script attributes (string + boolean toggled off)', () => {
      applyHeadToDocument(doc, { scripts: [{ src: '/a.js', async: true }] })
      const el = doc.head.querySelector('script[src="/a.js"]')
      expect(el?.hasAttribute('async')).toBe(true)

      applyHeadToDocument(doc, { scripts: [{ src: '/a.js', async: false, type: 'module' }] })
      expect(el?.hasAttribute('async')).toBe(false)
      expect(el?.getAttribute('type')).toBe('module')
    })

    it('adds a missing boolean script attribute on re-apply', () => {
      applyHeadToDocument(doc, { scripts: [{ src: '/test.js' }] })
      const el = doc.head.querySelector('script[src="/test.js"]')
      expect(el?.hasAttribute('async')).toBe(false)

      applyHeadToDocument(doc, { scripts: [{ src: '/test.js', async: true }] })
      expect(el?.hasAttribute('async')).toBe(true)
    })

    it('applies an inline <script> without src', () => {
      applyHeadToDocument(doc, { scripts: [{ type: 'module', defer: true }] })
      const el = doc.head.querySelector('script[defer]')
      expect(el?.getAttribute('type')).toBe('module')
      expect(el?.hasAttribute(STONE_HEAD_ATTR)).toBe(true)
    })

    it('applies <style> tag with type and media attributes', () => {
      applyHeadToDocument(doc, {
        styles: [{ content: 'body { background: white; }', type: 'text/css', media: 'screen' }]
      })
      const el = doc.head.querySelector('style')
      expect(el?.textContent).toContain('background: white')
      expect(el?.getAttribute('type')).toBe('text/css')
      expect(el?.getAttribute('media')).toBe('screen')
      expect(el?.hasAttribute(STONE_HEAD_ATTR)).toBe(true)
    })

    it('applies meta tag using property instead of name', () => {
      applyHeadToDocument(doc, { metas: [{ property: 'og:title', content: 'OpenGraph Title' }] })
      const el = doc.head.querySelector('meta[property="og:title"]')
      expect(el?.getAttribute('content')).toBe('OpenGraph Title')
      expect(el?.hasAttribute(STONE_HEAD_ATTR)).toBe(true)
    })

    it('applies JSON-LD and html/body attributes', () => {
      applyHeadToDocument(doc, {
        jsonLd: [{ '@type': 'Article', headline: 'Hi' }],
        htmlAttributes: { lang: 'en' },
        bodyAttributes: { class: 'app' }
      })
      const script = doc.head.querySelector('script[type="application/ld+json"]')
      expect(script?.textContent).toContain('"headline":"Hi"')
      expect(doc.documentElement.getAttribute('lang')).toBe('en')
      expect(doc.body.getAttribute('class')).toBe('app')
    })

    it('returns early if neither name nor property is defined', () => {
      applyHeadToDocument(doc, { metas: [{ content: 'empty-meta' } as any] })
      expect(doc.head.querySelectorAll('meta').length).toBe(0)
    })

    it('does not rewrite meta content if already matching', () => {
      applyHeadToDocument(doc, { metas: [{ name: 'keywords', content: 'a,b,c' }] })
      const el = doc.head.querySelector('meta[name="keywords"]')
      const spy = vi.spyOn(el as Element, 'setAttribute')

      applyHeadToDocument(doc, { metas: [{ name: 'keywords', content: 'a,b,c' }] })
      expect(spy).not.toHaveBeenCalledWith('content', 'a,b,c')
    })
  })

  describe('applyHeadToHtml (SSR)', () => {
    it('produces valid HTML string with escaped head context', () => {
      const html = '<html><head><title>Old</title><!--app-head--></head></html>'
      const result = applyHeadToHtml({
        title: 'New <Title>',
        metas: [{ name: 'viewport', content: 'width=device-width' }],
        links: [{ rel: 'icon', href: '/favicon.ico' }],
        scripts: [{ src: '/main.js', async: true }],
        styles: [{ content: 'body{margin:0}', type: 'text/css' }]
      }, html)

      expect(result).toContain('<title>New &lt;Title&gt;</title>')
      expect(result).toContain('<meta name="viewport" content="width=device-width">')
      expect(result).toContain('<link rel="icon" href="/favicon.ico">')
      expect(result).toContain('<script src="/main.js" async></script>')
      expect(result).toContain('<style type="text/css">body{margin:0}</style>')
    })

    it('merges html/body attributes', () => {
      const html = '<html><head><!--app-head--></head><body></body></html>'
      const result = applyHeadToHtml({ htmlAttributes: { lang: 'fr' }, bodyAttributes: { class: 'x' } }, html)
      expect(result).toContain('<html lang="fr">')
      expect(result).toContain('<body class="x">')
    })

    it('returns original HTML if context or html is empty', () => {
      const html = '<html><head><!--app-head--></head></html>'
      expect(applyHeadToHtml({}, html)).toBe(html)
      expect(applyHeadToHtml(undefined as any, html)).toBe(html)
      expect(applyHeadToHtml({ title: 'ok' }, '')).toBe('')
    })

    it('omits script boolean attributes that are false', () => {
      const html = '<html><head><!--app-head--></head></html>'
      const result = applyHeadToHtml({ scripts: [{ src: '/skip.js', async: false }] }, html)
      const scriptTag = /<script([^>]*)><\/script>/.exec(result)?.[1] ?? ''
      expect(scriptTag).toContain('src="/skip.js"')
      expect(scriptTag).not.toContain('async')
    })

    it('inserts a title containing $ replacement patterns literally', () => {
      const html = '<html><head><title>Old</title><!--app-head--></head></html>'
      const result = applyHeadToHtml({ title: 'Price $5 & up' }, html)
      expect(result).toContain('<title>Price $5 &amp; up</title>')
    })
  })
})
