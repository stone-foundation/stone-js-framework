import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { mcpAdapterBlueprint, McpAdapterAdapterConfig } from '../options/McpAdapterBlueprint'

/**
 * Options for the `@Mcp` decorator.
 */
export interface McpDecoratorOptions extends Partial<McpAdapterAdapterConfig> {}

/**
 * Class decorator registering the MCP adapter on a Stone application.
 *
 * @param options - Adapter options (merged over the defaults).
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @Mcp({ default: true })
 * @StoneApp()
 * class Application {}
 * ```
 */
export const Mcp = <T extends ClassType = ClassType>(options: McpDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(mcpAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
