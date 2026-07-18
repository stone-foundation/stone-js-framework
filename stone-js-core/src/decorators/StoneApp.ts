import { ClassType } from '../declarations'
import { STONE_APP_KEY } from './constants'
import { addBlueprint, classDecoratorLegacyWrapper, setMetadata } from './Metadata'
import { AppConfig, StoneBlueprint, stoneBlueprint } from '../options/StoneBlueprint'

/**
 * StoneApp options.
 *
 * This interface defines the configuration options for marking a class as the main application entry point.
 */
export interface StoneAppOptions extends Partial<AppConfig> {}

/**
 * StoneApp decorator to mark a class as the main application entry point.
 *
 * This decorator is useful for customizing classes that should be treated as the primary entry point for the Stone.js framework.
 * It allows for configuring the main application settings via the provided options.
 *
 * @param options - The configuration options for the application, based on StoneOptions.
 * @returns A decorator function to set metadata on the target class.
 *
 * @example
 * ```typescript
 * @StoneApp({ name: 'MyApplication', env: Environment.Development })
 * class MyApp {
 *   // Application logic here.
 * }
 * ```
 */
export const StoneApp = <T extends ClassType = ClassType>(
  options: StoneAppOptions = {},
  blueprints: Array<StoneBlueprint | Record<string, any>> = []
): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    setMetadata(context, STONE_APP_KEY, { isClass: true })
    addBlueprint(target, context, stoneBlueprint, ...blueprints, { stone: options })
  })
}
