import { HeadersType } from '../declarations'
import { decoratorResponseCallback } from '../utils'
import { noContentHttpResponse } from '../HttpResponse'
import { methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Decorator to mark a class method as a 204 outgoing http response.
 *
 * @param headers - The headers for the response.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * import { NoContentHttpResponse } from '@stone-js/http-core';
 *
 * class UserController {
 *   @NoContentHttpResponse()
 *   getUsers() {
 *     return { name: 'John Doe' };
 *   }
 * }
 * ```
 */
export const NoContentHttpResponse = <T extends Function = Function>(headers: HeadersType = {}): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>(<TFunction>(target: T, _context: ClassMethodDecoratorContext<T>): TFunction => {
    return decoratorResponseCallback(target, async () => noContentHttpResponse(headers))
  })
}
