import { McpDevOptions } from '../../declarations'
import { classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `McpDev` decorator.
 */
export interface McpDevDecoratorOptions extends McpDevOptions {}

/**
 * Browser stub of `@McpDev()`: a no-op.
 *
 * The dev MCP server (`stone mcp`) is a Node-only, development concern. Stubbing the decorator for
 * the browser keeps an isomorphic app compiling and inert there, without dragging the CLI command,
 * the MCP SDK server, or `node:fs` into the browser bundle (which would break a SPA). The real
 * decorator lives in the Node build.
 *
 * @param _options - Ignored in the browser.
 * @returns A no-op class decorator.
 */
export const McpDev = <T extends ClassType = ClassType>(_options: McpDevDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((_target: T, _context: ClassDecoratorContext<T>): undefined => {})
}
