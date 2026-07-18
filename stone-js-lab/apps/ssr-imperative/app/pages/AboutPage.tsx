import { JSX } from 'react'
import { definePage, IPage, ReactIncomingEvent, HeadContext, StoneLink } from '@stone-js/use-react'

/**
 * AboutPage — routed at `/about`. Imperative counterpart of the declarative `@Page('/about')`
 * class: a dependency-free factory returning an `IPage`, registered with `definePage`.
 */
export const AboutPage = (): IPage<ReactIncomingEvent> => ({
  head (): HeadContext {
    return {
      title: 'About — Stone.js Lab',
      description: 'About the Stone.js frontend lab (imperative).'
    }
  },

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
})

/** AboutPage route blueprint. */
export const AboutPageBlueprint = definePage(AboutPage, { path: '/about', name: 'about' })
