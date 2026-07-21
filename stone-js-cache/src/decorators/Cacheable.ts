import { CacheManager } from '../CacheManager'
import { resolveDecoratorKey } from '../utils'
import { CacheableOptions } from '../declarations'
import { methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Method decorator: cache the method's result (cache-aside).
 *
 * On the first call the method runs and its return value is stored; subsequent calls with the same
 * key return the cached value until it expires. Concurrent cold calls share one execution (stampede
 * protection). If the cache module is not enabled, the method runs normally (graceful no-op).
 *
 * @param options - Key/ttl/tags/store options (key defaults to `Class.method:<hash(args)>`).
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * class ReportService {
 *   @Cacheable({ ttl: 300, tags: ['reports'] })
 *   async monthly (year: number) { return await this.compute(year) }
 * }
 * ```
 */
export const Cacheable = <T extends Function = Function>(options: CacheableOptions = {}): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>(<TFunction>(target: T, context: ClassMethodDecoratorContext<T>): TFunction => {
    return async function (this: unknown, ...args: any[]): Promise<unknown> {
      const run = async (): Promise<unknown> => (target as Function).apply(this, args)
      const manager = CacheManager.getInstance()
      if (manager === undefined) { return await run() }

      const store = manager.store(options.store)
      const key = resolveDecoratorKey(options.key, this, String(context.name), args)

      return await store.remember(key, run, { ttl: options.ttl, tags: options.tags })
    } as TFunction
  })
}
