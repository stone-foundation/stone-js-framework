import { McpDevOptions } from '../declarations'
import { McpDevBlueprint, mcpDevBlueprint } from '../options/McpDevBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `McpDev` decorator.
 */
export interface McpDevDecoratorOptions extends McpDevOptions {}

/**
 * A class decorator that adds the `stone mcp` command to your app.
 *
 * Declarative counterpart of registering {@link mcpDevBlueprint}: apply it to your app class to
 * expose the framework-knowledge tools (plus any you declare) to a coding agent over MCP.
 *
 * @param options - The MCP dev options (server name, instructions, your tools).
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * @McpDev({ tools: [myTool] })
 * @StoneApp({ name: 'my-app' })
 * export class Application {}
 * ```
 */
export const McpDev = <T extends ClassType = ClassType>(options: McpDevDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    addBlueprint(target, context, mcpDevBlueprint, { stone: { mcpDev: options } } as unknown as McpDevBlueprint)
  })
}
