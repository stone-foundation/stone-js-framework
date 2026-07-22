import { JSX } from 'react'
import { Reveal } from '../components/ui/Reveal'
import { STARTERS } from '../starters/registry'
import { publishedArticles } from '../blog/registry.mjs'

interface Article { slug: string, title: string, excerpt: string, tags: string[], date: string, author: string }

// Format in UTC so SSR (server, UTC) and hydration (browser, local TZ) produce the SAME text.
// Without `timeZone: 'UTC'`, a `YYYY-MM-DD` date shifts a day in negative offsets and React
// throws a hydration mismatch (#418), which then breaks client-side navigation.
const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })

const OFFICIAL_STARTERS = STARTERS.filter((s) => s.official)
// Three core starters, then the agent-native one as the fourth card.
const FEATURED_STARTERS = [
  ...OFFICIAL_STARTERS.filter((s) => s.id !== 'agent-superpowers').slice(0, 3),
  ...OFFICIAL_STARTERS.filter((s) => s.id === 'agent-superpowers')
]
const FEATURED_ARTICLES = (publishedArticles('en') as Article[]).slice(0, 4)

/**
 * Ship-faster section: scaffold from a starter, then learn from the blog recipes.
 * Both are rendered from the same registries that power /starters and /blog.
 */
export function Showcase (): JSX.Element {
  return (
    <section id='showcase'>
      <div className='wrap'>
        <Reveal className='sec-head center'>
          <p className='eyebrow'><span className='psi'>ψ</span>Ship faster</p>
          <h2>Start from a template. Learn from the recipes.</h2>
          <p>
            Scaffold a real, running app in one command, then follow the blog recipes that build on
            the very same starters.
          </p>
        </Reveal>

        <Reveal className='show-sub'>
          <h3>Starters</h3>
          <a className='show-all' href='/starters'>All starters →</a>
        </Reveal>
        <div className='mods'>
          {FEATURED_STARTERS.map((s) => (
            <Reveal key={s.id} href='/starters' className='mod'>
              <span className='tier'>{s.problem}</span>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className='show-sub'>
          <h3>From the blog</h3>
          <a className='show-all' href='/blog'>All posts →</a>
        </Reveal>
        <div className='blog-cards'>
          {FEATURED_ARTICLES.map((a) => (
            <Reveal key={a.slug} href={`/blog/${a.slug}`} className='blog-card'>
              <p className='bc-meta'>{fmtDate(a.date)} · {a.author}</p>
              <h3 className='bc-title'>{a.title}</h3>
              <p className='bc-excerpt'>{a.excerpt}</p>
              <div className='bc-tags'>{a.tags.slice(0, 3).map((t) => <span key={t} className='bc-tag'>{t}</span>)}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
