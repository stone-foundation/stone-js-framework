import { JSX } from 'react'
import { IPage, Page, ReactIncomingEvent, StoneLink, HeadContext } from '@stone-js/use-react'

/**
 * Home Page component.
 */
@Page('/')
export class HomePage implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Welcome to Stone.js',
      description: 'Stone.js Blog Dashboard — write your domain once, Stone.js is the context that runs it anywhere.'
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render (): JSX.Element {
    return (
      <main className='stone-welcome'>
        <div className='glow' aria-hidden='true' />
        <section className='hero'>
          <img className='mark' src='/logo.svg' alt='Stone.js' width={104} height={104} />
          <p className='eyebrow'>Welcome to</p>
          <h1 className='title'>Stone.js</h1>
          <p className='lead'>Your Blog Dashboard is running.</p>
          <p className='tagline'>
            Write your domain once, Stone.js is the context that runs it anywhere:
            server, serverless, browser, CLI and the edge.
          </p>
          <nav className='links'>
            <StoneLink to='/posts'>Browse Posts</StoneLink>
            <StoneLink to='/users'>Browse Users</StoneLink>
            <a href='https://stonejs.dev/docs' target='_blank' rel='noreferrer noopener'>Documentation</a>
            <a href='https://github.com/stone-foundation/stone-js-framework' target='_blank' rel='noreferrer noopener'>GitHub</a>
          </nav>
        </section>
        <footer className='brand'><span className='dot'>●</span> Stone.js — the continuum framework</footer>
      </main>
    )
  }
}
