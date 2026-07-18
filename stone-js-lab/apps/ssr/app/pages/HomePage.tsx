import { JSX } from 'react'
import { WelcomeService } from '../services/WelcomeService'
import { IPage, Page, ReactIncomingEvent, PageRenderContext, HeadContext, StoneLink } from '@stone-js/use-react'

/** Data produced by {@link HomePage.handle} and consumed by {@link HomePage.render}. */
export interface HomeData {
  message: string
}

/**
 * HomePage — routed at `/`.
 *
 * `handle` runs on the server (SSR/SSG) or the client (CSR) to produce the data, `head` sets the
 * document head, `render` returns the React tree. `StoneLink` performs client-side navigation
 * (with an `<a href>` fallback), so this page is identical whether the app is CSR, SSR or SSG.
 */
@Page('/')
export class HomePage implements IPage<ReactIncomingEvent> {
  private readonly welcomeService: WelcomeService

  constructor ({ welcomeService }: { welcomeService: WelcomeService }) {
    this.welcomeService = welcomeService
  }

  handle (event: ReactIncomingEvent): HomeData {
    return { message: this.welcomeService.greet(event.get<string>('name', 'World')) }
  }

  head (): HeadContext {
    return {
      title: 'Home — Stone.js Lab',
      description: 'The Stone.js frontend lab home page.'
    }
  }

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
}
