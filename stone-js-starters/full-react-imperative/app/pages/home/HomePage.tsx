import { JSX } from 'react'
import { createPost } from '../utils'
import { Post } from '../../models/Post'
import { ILogger } from '@stone-js/core'
import { PostForm } from '../../components/PostForm/PostForm'
import { PostWidget } from '../../components/PostWidget/PostWidget'
import { IPostService } from '../../services/contracts/IPostService'
import { IPage, ReactIncomingEvent, HeadContext, definePage, IRouter, PageRenderContext } from '@stone-js/use-react'

/**
 * HomePage options.
 */
export interface HomePageOptions {
  router: IRouter
  logger: ILogger
  postService: IPostService
}

/**
 * Home Page.
 */
export const HomePage = ({ router, logger, postService }: HomePageOptions): IPage<ReactIncomingEvent> => ({
  head (): HeadContext {
    return {
      title: 'Home',
      description: 'Welcome to the Stone.js timeline'
    }
  },

  /**
   * Handle the incoming event.
   *
   * @param event - The incoming event.
   * @returns List of posts.
   */
  async handle (event: ReactIncomingEvent): Promise<Post[]> {
    return await postService.list(event.get<number>('limit', 10))
  },

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ data = [], event, container }: PageRenderContext<Post[]>): JSX.Element {
    return (
      <section>
        <PostForm onSubmit={createPost.bind(this, router, logger, postService)} />
        <PostWidget items={data} event={event} container={container} />
      </section>
    )
  }
})

/**
 * Home Page Blueprint.
 */
export const HomePageBlueprint = definePage(HomePage, { path: '/' })
