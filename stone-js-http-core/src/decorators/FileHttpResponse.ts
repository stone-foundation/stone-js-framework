import { HTTP_OK } from '../constants'
import { HeadersType } from '../declarations'
import { fileHttpResponse } from '../HttpResponse'
import { decoratorResponseCallback } from '../utils'
import { methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Decorator to mark a class method as a file outgoing http response.
 *
 * @param statusCode - The status code of the response.
 * @param headers - The headers for the response.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * import { FileHttpResponse } from '@stone-js/http-core';
 *
 * class UserController {
 *   @FileHttpResponse()
 *   getUsers() {
 *     return new File('path/to/file');
 *   }
 * }
 * ```
 */
export const FileHttpResponse = <T extends Function = Function>(statusCode: number = HTTP_OK, headers: HeadersType = {}): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>(<TFunction>(target: T, _context: ClassMethodDecoratorContext<T>): TFunction => {
    return decoratorResponseCallback(target, async (content: any) => fileHttpResponse(content, statusCode, headers))
  })
}
