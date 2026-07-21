import { CacheManager } from '../CacheManager'
import { resolveDecoratorKey } from '../utils'
import { CacheEvictOptions } from '../declarations'
import { methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Method decorator: invalidate cache after the method runs.
 *
 * By default it deletes the key `Class.method:<hash(args)>`. Pass `tags` to invalidate a group, or
 * `all: true` to clear the store. The method always runs; invalidation happens on success. If the
 * cache module is not enabled, the method runs normally (graceful no-op).
 *
 * @param options - key / tags / all / store options.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * class ReportService {
 *   @CacheEvict({ tags: ['reports'] })
 *   async regenerate () { ... }
 * }
 * ```
 */
export const CacheEvict = <T extends Function = Function>(options: CacheEvictOptions = {}): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>(<TFunction>(target: T, context: ClassMethodDecoratorContext<T>): TFunction => {
    return async function (this: unknown, ...args: any[]): Promise<unknown> {
      const result = await (target as Function).apply(this, args)
      const manager = CacheManager.getInstance()

      if (manager !== undefined) {
        const store = manager.store(options.store)
        if (options.all === true) {
          await store.clear()
        } else if (options.tags !== undefined && options.tags.length > 0) {
          await store.invalidateTags(options.tags)
        } else {
          await store.delete(resolveDecoratorKey(options.key, this, String(context.name), args))
        }
      }

      return result
    } as TFunction
  })
}
