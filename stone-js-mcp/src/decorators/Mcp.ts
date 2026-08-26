import { cloneValue } from '@stone-js/config'
import { McpConfig } from '../declarations'
import { mcpBlueprint } from '../options/McpBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/** Options for the `@Mcp` activation. */
export interface McpDecoratorOptions extends McpConfig {}

/**
 * Expose this application's routes to AI agents, over MCP.
 *
 * The declarative half of the module's activation; `mcpBlueprint` is the imperative half, and
 * neither can do what the other cannot. It puts the endpoint in place and nothing more: no route
 * becomes a tool until it says so.
 *
 * @param options - What to configure, if anything.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @Mcp({ instructions: 'Tools for managing notes.' })
 * @Routing()
 * @StoneApp()
 * export class Application {}
 * ```
 */
export const Mcp = <T extends ClassType = ClassType>(options: McpDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(mcpBlueprint)

    // The blueprint is the single source of truth for what the module declares; the decorator
    // overrides only what it can, its own options bucket.
    blueprint.stone.mcp = { ...blueprint.stone.mcp, ...options }

    addBlueprint(target, context, blueprint)
  })
}
