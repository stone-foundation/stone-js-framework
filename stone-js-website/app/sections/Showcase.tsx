import { JSX } from 'react'
import { Reveal } from '../components/ui/Reveal'
import { STARTERS } from '../starters/registry'
import { publishedArticles } from '../blog/registry.mjs'

interface Article { slug: string, title: string, excerpt: string, tags: string[] }

const FEATURED_STARTERS = STARTERS.filter((s) => s.official).slice(0, 3)
const FEATURED_ARTICLES = (publishedArticles('en') as Article[]).slice(0, 3)

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
        <div className='mods'>
          {FEATURED_ARTICLES.map((a) => (
            <Reveal key={a.slug} href={`/blog/${a.slug}`} className='mod'>
              <span className='tier'>{a.tags[0]}</span>
              <h3>{a.title}</h3>
              <p>{a.excerpt}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
