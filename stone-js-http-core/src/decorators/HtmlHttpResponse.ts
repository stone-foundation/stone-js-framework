import { HTTP_OK } from '../constants'
import { HeadersType } from '../declarations'
import { htmlHttpResponse } from '../HttpResponse'
import { decoratorResponseCallback } from '../utils'
import { methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Decorator to mark a class method as an html outgoing http response.
 *
 * @param statusCode - The status code of the response.
 * @param headers - The headers for the response.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * import { HtmlHttpResponse } from '@stone-js/http-core';
 *
 * class UserController {
 *   @HtmlHttpResponse()
 *   getUsers() {
 *     return '<h1>Hello World</h1>';
 *   }
 * }
 * ```
 */
export const HtmlHttpResponse = <T extends Function = Function>(statusCode: number = HTTP_OK, headers: HeadersType = {}): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>(<TFunction>(target: T, _context: ClassMethodDecoratorContext<T>): TFunction => {
    return decoratorResponseCallback(target, async (content: any) => htmlHttpResponse(content, statusCode, headers))
  })
}
