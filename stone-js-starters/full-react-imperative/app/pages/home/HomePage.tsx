import { JSX } from 'react'
import { Post } from '../../models/Post'
import { IPostService } from '../../services/contracts/IPostService'
import { IPage, ReactIncomingEvent, HeadContext, definePage, StoneLink, PageRenderContext } from '@stone-js/use-react'

/**
 * HomePage options.
 */
export interface HomePageOptions {
  postService: IPostService
}

/**
 * Home Page.
 */
export const HomePage = ({ postService }: HomePageOptions): IPage<ReactIncomingEvent> => ({
  head (): HeadContext {
    return {
      title: 'Welcome to Stone.js',
      description: 'Stone.js timeline — write your domain once, Stone.js is the context that runs it anywhere.'
    }
  },

  /**
   * Handle the incoming event.
   *
   * @param event - The incoming event.
   * @returns List of posts.
   */
  async handle (event: ReactIncomingEvent): Promise<Post[]> {
    try {
      return await postService.list(event.get<number>('limit', 10))
    } catch {
      // The welcome hero is public: render gracefully even when the API is unreachable.
      return []
    }
  },

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ data = [] }: PageRenderContext<Post[]>): JSX.Element {
    const count = data.length
    const lead = `Your timeline is live — ${count} ${count === 1 ? 'post' : 'posts'} published.`
    return (
      <main className='stone-welcome'>
        <div className='glow' aria-hidden='true' />
        <section className='hero'>
          <img className='mark' src='/logo.svg' alt='Stone.js' width={104} height={104} />
          <p className='eyebrow'>Welcome to</p>
          <h1 className='title'>Stone.js</h1>
          <p className='lead'>{lead}</p>
          <p className='tagline'>
            Write your domain once, Stone.js is the context that runs it anywhere:
            server, serverless, browser, CLI and the edge.
          </p>
          <nav className='links'>
            <StoneLink to='/users'>Browse Users</StoneLink>
            <a href='https://stonejs.dev/docs' target='_blank' rel='noreferrer noopener'>Documentation</a>
            <a href='https://github.com/stone-foundation/stone-js-framework' target='_blank' rel='noreferrer noopener'>GitHub</a>
          </nav>
        </section>
        <footer className='brand'><span className='dot'>●</span> Stone.js — the continuum framework</footer>
      </main>
    )
  }
})

/**
 * Home Page Blueprint.
 */
export const HomePageBlueprint = definePage(HomePage, { path: '/' })
