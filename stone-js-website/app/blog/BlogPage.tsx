import { JSX } from 'react'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'

/** The launch set, previewed while the blog is being built. */
const UPCOMING = [
  { title: 'Introducing Stone.js', blurb: 'The Continuum thesis: write the domain once, let the context apply at run time.' },
  { title: 'Direct-to-cloud file uploads with signed URLs', blurb: 'SPA to signed URL to cloud storage, then submit. The whole architecture, and a ready starter.' },
  { title: 'One domain, three runtimes', blurb: 'The same app on Node, serverless and the edge. The thing a single-target framework cannot do.' },
  { title: 'Stateless auth at the edge', blurb: 'JWT and OAuth with no session store, so the same guard runs everywhere.' }
]

/**
 * Blog landing (header nav, own section). Full article system, diagrams, sharing
 * and RSS land next; this previews the launch set.
 */
@Page('/blog', { layout: 'site' })
export class BlogPage implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Blog · Stone.js',
      description: 'Cloud-native architecture solutions, each with a diagram, the Stone.js modules that solve it, and a ready-to-install starter.'
    }
  }

  render (): JSX.Element {
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
        <p className='st-count'>Launching soon</p>
        <div className='st-grid'>
          {UPCOMING.map((a) => (
            <article key={a.title} className='st-card is-soon'>
              <div className='st-card-head'><span className='st-badge'>soon</span></div>
              <h3 className='st-title'>{a.title}</h3>
              <p className='st-desc-static'>{a.blurb}</p>
            </article>
          ))}
        </div>
      </div>
    )
  }
}
