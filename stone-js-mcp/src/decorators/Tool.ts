import { McpInput } from '../declarations'
import { TOOL_KEY } from './constants'
import { addMetadata, methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Declare that a handler method is a tool.
 *
 * The same shape as `@Validate` and `@Returns`, and the same purpose: a controller-first
 * application says it on the method rather than on the route option. Both are read, and the route
 * option wins when both are present, because with a router in play a route is the single
 * description of itself.
 *
 * @param mcp - The tool's name, or its full declaration.
 * @returns A method decorator.
 *
 * @example
 * ```ts
 * class NotesController {
 *   @Tool({ name: 'create-note', description: 'Create a note for the signed-in user.' })
 *   @Post('/notes')
 *   create (event: IncomingHttpEvent) { … }
 * }
 * ```
 */
export const Tool = <T extends Function = Function>(mcp: McpInput): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>((_target: T, context: ClassMethodDecoratorContext<T>): undefined => {
    addMetadata(context as ClassMethodDecoratorContext, TOOL_KEY, { action: context.name, mcp })
  })
}
