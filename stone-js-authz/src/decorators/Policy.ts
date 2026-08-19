import { POLICY_KEY } from './constants'
import { setClassMetadata } from '@stone-js/core'

/**
 * Class decorator: register a policy class under a name.
 *
 * ```ts
 * @Policy('post.update')
 * export class UpdatePostPolicy implements IPolicy {
 *   private readonly posts: PostService
 *   constructor ({ posts }: { posts: PostService }) { this.posts = posts }
 *
 *   async authorize (event: IncomingEvent): Promise<boolean> {
 *     const post = await this.posts.find(event.get('id'))
 *     return post.authorId === event.getMetadataValue<JwtClaims>('auth')?.sub
 *   }
 * }
 * ```
 *
 * Routes and handlers then name it (`@Can('post.update')`, or `{ authz: 'post.update' }`), so a rule
 * that needs to load the record it protects lives in its own file and gets its services through the
 * constructor, exactly like a schema or a resource class. A rule expressed only as an ability cannot
 * do that; a policy can.
 *
 * @param alias - The name the policy is registered under. Defaults to the class name, which the
 * discovery middleware fills in, since it is the one holding the class.
 * @returns A class decorator.
 */
export const Policy = (alias?: string): ClassDecorator => {
  return setClassMetadata(POLICY_KEY, { alias })
}
