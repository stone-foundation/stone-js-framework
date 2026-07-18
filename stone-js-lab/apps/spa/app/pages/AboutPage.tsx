import { JSX } from 'react'
import { IPage, Page, ReactIncomingEvent, HeadContext, StoneLink } from '@stone-js/use-react'

/**
 * AboutPage — routed at `/about`.
 *
 * A pure presentational page (no `handle`): it proves multi-page routing and client-side
 * navigation back to the home page via `StoneLink`.
 */
@Page('/about')
export class AboutPage implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'About — Stone.js Lab',
      description: 'About the Stone.js frontend lab.'
    }
  }

  render (): JSX.Element {
    return (
      <section className='container'>
        <h1 className='h1 text-center mt-64'>About</h1>
        <p className='text-center'>Built once, rendered CSR, SSR or SSG — same code.</p>
        <nav className='text-center'>
          <StoneLink to='/'>← Home</StoneLink>
        </nav>
      </section>
    )
  }
}
