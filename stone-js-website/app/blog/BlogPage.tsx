import { publishedArticles } from './registry.mjs'
import { JSX } from 'react'
import { HeadContext, IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

/** Human date, e.g. "20 Jul 2026". */
function fmtDate (iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d} ${months[(m ?? 1) - 1]} ${y}`
}

/**
 * Blog landing (header nav, own section): the published articles from the
 * registry. Each recipe ships a diagram, the modules that solve it, and a starter.
 */
@Page('/blog', { layout: 'site' })
export class BlogPage implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Blog · Stone.js',
      description: 'Cloud-native architecture solutions, each with a diagram, the Stone.js modules that solve it, and a ready-to-install starter.',
      links: [{ rel: 'alternate', type: 'application/rss+xml', href: '/blog/feed.xml', title: 'Stone.js Blog' }]
    }
  }

  render (): JSX.Element {
    const articles = publishedArticles('en')
    return (
      <div className='wrap st-wrap'>
        <header className='section-hero'>
          <p className='eyebrow'><span className='psi'>ψ</span>Educate, then build</p>
          <h1 className='mono-title'>Blog</h1>
          <p className='lede'>
            Real cloud-native problems, solved. Each piece ships an architecture diagram, the
            Stone.js modules that carry it, and a starter you can install and run today.
          </p>
        </header>
        <div className='blog-list'>
          {articles.map((a) => (
            <StoneLink key={a.slug} to={`/blog/${a.slug}`} className='blog-item'>
              <p className='blog-item-meta'>{fmtDate(a.date)} · {a.author}</p>
              <h2 className='blog-item-title'>{a.title}</h2>
              <p className='blog-item-excerpt'>{a.excerpt}</p>
              <div className='blog-item-tags'>{a.tags.map((t) => <span key={t} className='article-tag'>{t}</span>)}</div>
            </StoneLink>
          ))}
        </div>
      </div>
    )
  }
}
