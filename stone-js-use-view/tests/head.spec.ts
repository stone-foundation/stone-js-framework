import { describe, it, expect } from 'vitest'
import { escapeHtml, sanitizeAttrName, serializeHead, replacePlaceholder } from '../src/head'

describe('escapeHtml', () => {
  it('escapes the five HTML-sensitive characters', () => {
    expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;')
  })
})

describe('sanitizeAttrName', () => {
  it('drops characters that could break out of an attribute name', () => {
    expect(sanitizeAttrName('data-x')).toBe('data-x')
    expect(sanitizeAttrName('on click"><img')).toBe('onclickimg')
  })
})

describe('serializeHead', () => {
  it('serializes title, description, metas and links with escaped values', () => {
    const html = serializeHead({
      title: 'Hello <b>',
      description: 'A & B',
      metas: [{ name: 'og:title', content: 'X"Y' }],
      links: [{ rel: 'canonical', href: 'https://x/?a=1&b=2' }]
    })

    expect(html).toContain('<title>Hello &lt;b&gt;</title>')
    expect(html).toContain('content="A &amp; B"')
    expect(html).toContain('content="X&quot;Y"')
    expect(html).toContain('href="https://x/?a=1&amp;b=2"')
    // meta/link are void elements — no closing tag.
    expect(html).not.toContain('</meta>')
    expect(html).not.toContain('</link>')
  })

  it('emits boolean attributes without a value and skips false/null', () => {
    const html = serializeHead({ scripts: [{ src: '/a.js', defer: true, nomodule: false }] })
    expect(html).toContain('<script src="/a.js" defer></script>')
    expect(html).not.toContain('nomodule')
  })

  it('does not escape inline style/script content (trusted), but escapes attribute names', () => {
    const html = serializeHead({ styles: [{ content: 'a > b { color: red }', 'bad name': 'x' }] })
    expect(html).toContain('a > b { color: red }') // CSS child selector preserved
    expect(html).toContain('badname="x"') // attribute name sanitized
  })

  it('rejects an injected attribute name entirely if it sanitizes to empty', () => {
    const html = serializeHead({ metas: [{ '"><script>': 'x', name: 'ok', content: 'v' }] })
    expect(html).not.toContain('<script>')
    expect(html).toContain('name="ok"')
  })
})

describe('replacePlaceholder', () => {
  it('inserts content literally even when it contains $-replacement patterns', () => {
    const out = replacePlaceholder('<!--app-html-->', '<!--app-html-->', "price is $& and $' ok")
    expect(out).toBe("price is $& and $' ok")
  })
})
