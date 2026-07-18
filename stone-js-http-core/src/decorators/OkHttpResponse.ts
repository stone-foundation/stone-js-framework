import { HeadersType } from '../declarations'
import { okHttpResponse } from '../HttpResponse'
import { decoratorResponseCallback } from '../utils'
import { methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Decorator to mark a class method as a 200 outgoing http response.
 *
 * @param headers - The headers for the response.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * import { OkHttpResponse } from '@stone-js/http-core';
 *
 * class UserController {
 *   @OkHttpResponse()
 *   getUsers() {
 *     return { name: 'John Doe' };
 *   }
 * }
 * ```
 */
export const OkHttpResponse = <T extends Function = Function>(headers: HeadersType = {}): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>(<TFunction>(target: T, _context: ClassMethodDecoratorContext<T>): TFunction => {
    return decoratorResponseCallback(target, async (content: any) => okHttpResponse(content, headers))
  })
}
