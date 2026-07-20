import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { publishedArticles } from '../app/blog/registry.mjs'

/**
 * Generates dist/blog/feed.xml from the shared article registry, after the SSG
 * build. RSS gives the blog reach (readers, aggregators) beyond social shares.
 */
const SITE = 'https://stonejs.dev'
const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', 'dist', 'blog', 'feed.xml')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const articles = publishedArticles('en')

const items = articles.map((a) => `
    <item>
      <title>${esc(a.title)}</title>
      <link>${SITE}/blog/${a.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${a.slug}</guid>
      <pubDate>${new Date(`${a.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(a.excerpt)}</description>
      ${a.tags.map((t) => `<category>${esc(t)}</category>`).join('')}
    </item>`).join('')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Stone.js Blog</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>Cloud-native architecture solutions with Stone.js: a diagram, the modules that solve it, and a ready starter.</description>
    <language>en</language>${items}
  </channel>
</rss>
`

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, xml, 'utf-8')
console.log(`RSS: wrote ${articles.length} item(s) to dist/blog/feed.xml`)
