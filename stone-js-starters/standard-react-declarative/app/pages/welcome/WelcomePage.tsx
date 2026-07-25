import { JSX } from 'react'
import { Promiseable } from '@stone-js/core'
import { WelcomeService } from '../../services/WelcomeService'
import { Page, ReactIncomingEvent, PageRenderContext, PageHeadContext, HeadContext, IPage } from '@stone-js/use-react'

/**
 * WelcomePage Options
*/
export interface WelcomePageOptions {
  welcomeService: WelcomeService
}

/**
 * Response data
 */
export interface ResponseData {
  message: string
}

/**
 * Welcome Page component.
 */
@Page('/:name?')
export class WelcomePage implements IPage<ReactIncomingEvent> {
  private readonly welcomeService: WelcomeService

  /**
   * Create a new instance of WelcomePage
   *
   * @param welcomeService
   */
  constructor ({ welcomeService }: WelcomePageOptions) {
    this.welcomeService = welcomeService
  }

  /**
   * Handle the incoming event.
   *
   * @param event - The incoming event.
   * @returns A welcome message
  */
  handle (event: ReactIncomingEvent): ResponseData {
    return this.welcomeService.welcome(event.get<string>('name', 'World'))
  }

  /**
   * Set the page head tags, like title, meta, link, script, style.
   *
   * @returns The head context.
   */
  head ({ event }: PageHeadContext): Promiseable<HeadContext> {
    return {
      title: `${String(event.get<string>('name', 'World'))} · Welcome to Stone.js`,
      description: 'A universal Stone.js application. Write your domain once; Stone.js is the context that runs it anywhere.',
      metas: [
        { name: 'author', content: 'Stone.js' },
        { name: 'keywords', content: 'stonejs,continuum,react,universal,framework' }
      ]
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ data }: PageRenderContext<ResponseData>): JSX.Element {
    return (
      <main className='stone-welcome'>
        <div className='glow' aria-hidden='true' />
        <section className='hero'>
          <img className='mark' src='/logo.svg' alt='Stone.js' width={104} height={104} />
          <p className='eyebrow'>Welcome to</p>
          <h1 className='title'>Stone.js</h1>
          <p className='lead'>{data?.message}</p>
          <p className='tagline'>
            Your app is running. Write your domain once, Stone.js is the context that runs it
            anywhere: server, serverless, browser, CLI and the edge.
          </p>
          <nav className='links'>
            <a href='https://stonejs.dev/docs' target='_blank' rel='noreferrer noopener'>Documentation</a>
            <a href='https://github.com/stone-foundation/stone-js-framework' target='_blank' rel='noreferrer noopener'>GitHub</a>
            <span className='edit'>Edit <b>app/pages/welcome/WelcomePage.tsx</b></span>
          </nav>
        </section>
        <footer className='brand'><span className='dot'>●</span> Stone.js — the continuum framework</footer>
      </main>
    )
  }
}
