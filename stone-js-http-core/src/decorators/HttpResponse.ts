import { HTTP_OK } from '../constants'
import { HeadersType } from '../declarations'
import { createHttpResponse } from '../HttpResponse'
import { decoratorResponseCallback } from '../utils'
import { methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Decorator to mark a class method as an outgoing http response.
 *
 * @param statusCode - The status code of the response.
 * @param headers - The headers for the response.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * import { HttpResponse } from '@stone-js/http-core';
 *
 * class UserController {
 *   @HttpResponse(200)
 *   getUsers() {
 *     return { name: 'John Doe' };
 *   }
 * }
 * ```
 */
export const HttpResponse = <T extends Function = Function>(statusCode: number = HTTP_OK, headers: HeadersType = {}): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>(<TFunction>(target: T, _context: ClassMethodDecoratorContext<T>): TFunction => {
    return decoratorResponseCallback(target, async (content: any) => createHttpResponse(content, statusCode, headers))
  })
}
