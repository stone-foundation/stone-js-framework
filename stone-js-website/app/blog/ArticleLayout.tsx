import { ShareBar } from './components/ShareBar'
import { STARTERS } from '../starters/registry'
import { articleBySlug } from './registry.mjs'
import { SITE_URL } from '../site'
import { JSX, ReactNode } from 'react'
import { HeadContext, StoneLink } from '@stone-js/use-react'

/** Build the per-article head: title, description, canonical, OpenGraph, Twitter. */
export function articleHead (slug: string): HeadContext {
  const a = articleBySlug(slug)
  const url = `${SITE_URL}/blog/${slug}`
  const title = `${a?.title ?? 'Article'} · Stone.js`
  const description = a?.excerpt ?? ''
  const image = a?.ogImage !== undefined ? `${SITE_URL}${a.ogImage}` : `${SITE_URL}/favicon.svg`
  return {
    title,
    description,
    metas: [
      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: a?.title ?? '' },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'article:published_time', content: a?.date ?? '' },
      { name: 'author', content: a?.author ?? 'Stone Foundation' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: a?.title ?? '' },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image }
    ],
    links: [{ rel: 'canonical', href: url }]
  }
}

/** Human date, e.g. "20 July 2026". */
function fmtDate (iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${d} ${months[(m ?? 1) - 1]} ${y}`
}

/**
 * The article shell: masthead (back link, title, date · author, tags), the body,
 * a share bar, and the ready starter when the recipe ships one.
 */
export function ArticleLayout ({ slug, children }: { slug: string, children: ReactNode }): JSX.Element {
  const a = articleBySlug(slug)
  const starter = a?.starter != null ? STARTERS.find((s) => s.id === a.starter) : undefined

  return (
    <article className='wrap article'>
      <StoneLink to='/blog' className='article-back'>← Blog</StoneLink>
      <header className='article-head'>
        <h1 className='article-title'>{a?.title}</h1>
        <p className='article-meta'>
          {a !== undefined && <time dateTime={a.date}>{fmtDate(a.date)}</time>}
          <span className='article-dot'>·</span>{a?.author}
        </p>
        {a?.tags !== undefined && a.tags.length > 0 && (
          <div className='article-tags'>{a.tags.map((t) => <span key={t} className='article-tag'>{t}</span>)}</div>
        )}
      </header>

      <div className='article-body'>{children}</div>

      {starter !== undefined && (
        <aside className='article-starter'>
          <p className='article-starter-eyebrow'>Ready to run</p>
          <h2>{starter.title}</h2>
          <p>{starter.description}</p>
          <div className='st-cmd'><code>{starter.command}</code></div>
          <StoneLink to='/starters' className='btn btn-ghost'>Browse all starters →</StoneLink>
        </aside>
      )}

      <ShareBar slug={slug} title={a?.title ?? 'Stone.js'} />
    </article>
  )
}
