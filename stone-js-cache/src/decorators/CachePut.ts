import { CacheManager } from '../CacheManager'
import { resolveDecoratorKey } from '../utils'
import { CachePutOptions } from '../declarations'
import { methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Method decorator: always run the method, then write its result to the cache.
 *
 * Unlike `@Cacheable` (which short-circuits on a hit), `@CachePut` executes every time and refreshes
 * the cached value, keeping the cache warm and consistent after a write. If the cache module is not
 * enabled, the method runs normally (graceful no-op).
 *
 * @param options - key / ttl / tags / store options.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * class UserService {
 *   @CachePut({ key: (id) => `user:${id}`, ttl: 600 })
 *   async update (id: string, data: object) { return await this.save(id, data) }
 * }
 * ```
 */
export const CachePut = <T extends Function = Function>(options: CachePutOptions = {}): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>(<TFunction>(target: T, context: ClassMethodDecoratorContext<T>): TFunction => {
    return async function (this: unknown, ...args: any[]): Promise<unknown> {
      const result = await (target as Function).apply(this, args)
      const manager = CacheManager.getInstance()

      if (manager !== undefined) {
        const store = manager.store(options.store)
        const key = resolveDecoratorKey(options.key, this, String(context.name), args)
        await store.set(key, result, { ttl: options.ttl, tags: options.tags })
      }

      return result
    } as TFunction
  })
}
