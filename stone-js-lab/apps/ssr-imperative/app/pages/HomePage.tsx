import { JSX } from 'react'
import { WelcomeService } from '../services/WelcomeService'
import { definePage, IPage, ReactIncomingEvent, PageRenderContext, HeadContext, StoneLink } from '@stone-js/use-react'

/** Data produced by `handle` and consumed by `render`. */
export interface HomeData {
  message: string
}

/** Page dependencies auto-wired from the container. */
interface Deps { welcomeService: WelcomeService }

/**
 * HomePage — routed at `/`. The imperative counterpart of the declarative `@Page('/')` class:
 * a factory function returning an `IPage` object, registered with `definePage`.
 */
export const HomePage = ({ welcomeService }: Deps): IPage<ReactIncomingEvent> => ({
  handle (event: ReactIncomingEvent): HomeData {
    return { message: welcomeService.greet(event.get<string>('name', 'World')) }
  },

  head (): HeadContext {
    return {
      title: 'Home — Stone.js Lab',
      description: 'The Stone.js frontend lab home page (imperative).'
    }
  },

  render ({ data }: PageRenderContext<HomeData>): JSX.Element {
    return (
      <section className='container'>
        <h1 className='h1 text-center mt-64'>{data?.message}</h1>
        <p className='text-center'>Welcome to the Stone.js frontend lab.</p>
        <nav className='text-center'>
          <StoneLink to='/about'>About →</StoneLink>
        </nav>
      </section>
    )
  }
})

/** HomePage route blueprint. */
export const HomePageBlueprint = definePage(HomePage, { path: '/', name: 'home' })
