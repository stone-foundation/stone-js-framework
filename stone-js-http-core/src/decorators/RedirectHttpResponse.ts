import { HTTP_OK } from '../constants'
import { HeadersType } from '../declarations'
import { decoratorResponseCallback, declareResponseStatus } from '../utils'
import { redirectHttpResponse } from '../HttpResponse'
import { methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Decorator to mark a class method as a redirect outgoing http response.
 *
 * @param statusCode - The status code of the response.
 * @param headers - The headers for the response.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * import { RedirectHttpResponse } from '@stone-js/http-core';
 *
 * class UserController {
 *   @RedirectHttpResponse()
 *   getUsers() {
 *     return new URL('https://www.google.com');
 *   }
 * }
 * ```
 */
export const RedirectHttpResponse = <T extends Function = Function>(statusCode: number = HTTP_OK, headers: HeadersType = {}): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>(<TFunction>(target: T, context: ClassMethodDecoratorContext<T>): TFunction => {
    declareResponseStatus(context as ClassMethodDecoratorContext, statusCode)
    return decoratorResponseCallback(target, async (content: any) => redirectHttpResponse(content, statusCode, headers))
  })
}
