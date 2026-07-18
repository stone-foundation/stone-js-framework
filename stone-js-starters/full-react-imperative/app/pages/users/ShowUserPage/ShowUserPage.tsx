import { JSX } from 'react'
import { createPost } from '../../utils'
import { User } from '../../../models/User'
import { Post } from '../../../models/Post'
import { dateTimeFromNow } from '../../../utils'
import { ILogger, isNotEmpty } from '@stone-js/core'
import { PostForm } from '../../../components/PostForm/PostForm'
import { UserAvatar } from '../../../components/UserAvatar/UserAvatar'
import { PostWidget } from '../../../components/PostWidget/PostWidget'
import { IPostService } from '../../../services/contracts/IPostService'
import { IUserService } from '../../../services/contracts/IUserService'
import { IPage, ReactIncomingEvent, PageRenderContext, definePage, HeadContext, IRouter } from '@stone-js/use-react'

/**
 * Show User Page options.
 */
export interface ShowUserPageOptions {
  router: IRouter
  logger: ILogger
  postService: IPostService
  userService: IUserService
}

/**
 * Show User Page component.
 */
export const ShowUserPage = ({ router, logger, postService }: ShowUserPageOptions): IPage<ReactIncomingEvent> => ({
  head (): HeadContext {
    return {
      title: 'User Profile',
      description: 'Welcome to the user profile page'
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
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ data, event, container }: PageRenderContext): JSX.Element {
    const user = event.get<User>('user') ?? {} as unknown as User

    return (
      <div className='user-profile-page'>
        <div className='profile-cover' />

        <div className='profile-header'>
          <div className='profile-avatar'>
            <UserAvatar user={user} size={96} />
          </div>
          <div className='profile-info'>
            <h1>{user.name}</h1>
            <p className='email'>{user.email}</p>
            {user.bio !== undefined && <p className='bio'>{user.bio}</p>}
            <p className='status'>
              {user.isOnline
                ? <span className='online'>🟢 Online</span>
                : `Last seen ${dateTimeFromNow(user.lastSeen)}`}
            </p>
          </div>
        </div>

        <section className='profile-timeline'>
          <PostForm onSubmit={createPost.bind(this, router, logger, postService)} />
          <PostWidget items={data ?? []} event={event} container={container} />
        </section>
      </div>
    )
  }
})

/**
 * Delete the user.
 *
 * @param container - The container.
 * @param user - The user
 */
export async function deleteUser (userService: IUserService, user?: User): Promise<void> {
  if (isNotEmpty<User>(user) && window.confirm('Are you sure you want to delete this user?')) {
    await userService.delete(user.id)
  }
}

/**
 * Show User Page Blueprint.
 */
export const ShowUserPageBlueprint = definePage(
  ShowUserPage,
  {
    path: '/users/:user@id(\\d+)',
    bindings: { user: 'userService@findBy' }
  }
)
