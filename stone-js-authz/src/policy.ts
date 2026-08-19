import { IncomingEvent } from '@stone-js/core'

/**
 * The contract a policy class exposes.
 *
 * One method, `authorize(event)`, returning whether the caller may proceed. It receives the event, so
 * a policy can load the record it protects, and it is resolved by the container, so its constructor
 * receives the services it needs to do that:
 *
 * ```ts
 * @Policy('post.update')
 * export class UpdatePostPolicy implements IPolicy {
 *   constructor ({ posts }: { posts: PostService }) { this.posts = posts }
 *   async authorize (event) {
 *     const post = await this.posts.find(event.get('id'))
 *     return post.authorId === event.getMetadataValue('auth')?.sub
 *   }
 * }
 * ```
 *
 * That is the case an ability alone cannot express: "may update **this** post" needs the post. An
 * ability answers what a role may do; a policy answers what this caller may do to this record.
 */
export interface IPolicy {
  /** Whether the caller may proceed. */
  authorize: (event: IncomingEvent) => boolean | Promise<boolean>
}

/** A class that can be resolved into an {@link IPolicy}. */
export type PolicyClass = new (...args: any[]) => IPolicy

/**
 * Whether a value is a policy class rather than a policy.
 *
 * @param value - The candidate.
 * @returns Whether it must be resolved before use.
 */
export function isPolicyClass (value: unknown): value is PolicyClass {
  return typeof value === 'function' && typeof (value as any).prototype?.authorize === 'function'
}

/**
 * Whether a value is an already-built policy.
 *
 * @param value - The candidate.
 * @returns Whether it exposes `authorize`.
 */
export function isPolicy (value: unknown): value is IPolicy {
  return typeof value === 'object' && value !== null && typeof (value as any).authorize === 'function'
}

/**
 * The imperative counterpart of a policy class: a plain function.
 *
 * It receives the same dependencies a class would get through its constructor.
 *
 * @param authorize - Decides whether the caller may proceed.
 * @returns A factory producing a policy.
 *
 * @example
 * ```typescript
 * export const updatePostPolicy = definePolicy(({ posts }) => async (event) => {
 *   const post = await posts.find(event.get('id'))
 *   return post.authorId === event.getMetadataValue('auth')?.sub
 * })
 * ```
 */
export function definePolicy (
  authorize: (dependencies: any) => (event: IncomingEvent) => boolean | Promise<boolean>
): (dependencies: any) => IPolicy {
  return (dependencies: any) => ({ authorize: authorize(dependencies) })
}
