import { HeadersType } from '../declarations'
import { methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Decorator to set the status code of the response.
 *
 * @param statusCode - The status code of the response.
 * @param headers - The headers for the response.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * import { Page, PageStatus } from '@stone-js/use-react';
 *
 * @Page('/user-profile')
 * class UserPage {
 *   @PageStatus()
 *   handle() {
 *     return { name: 'John Doe' };
 *   }
 * }
 * ```
 */
export const PageStatus = <T extends Function = Function>(statusCode: number = 200, headers: HeadersType = {}): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>(<TFunction>(target: T, _context: ClassMethodDecoratorContext<T>): TFunction => {
    return async function (this: T, ...args: any[]): Promise<any> {
      const content = await (target as Function).apply(this, args)
      return { content, statusCode, headers }
    } as TFunction
  })
}
