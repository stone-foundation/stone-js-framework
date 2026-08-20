import { cloneValue } from '@stone-js/config'
import { ValidationConfig, validationBlueprint } from '../options/ValidationBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@Validation` decorator: the `stone.validation` bucket, every key optional.
 */
export interface ValidationDecoratorOptions extends ValidationConfig {}

/**
 * Class decorator: validate incoming data against the schemas you already write, declaratively.
 *
 * `@Validation()` registers the validation service provider, so `constructor ({ validator })` works
 * anywhere and the `@Validate()` route decorators have something to resolve. There is no kernel
 * middleware here: validation runs where it is asked for, not on every event.
 *
 * The declarative half of the pair; `validationBlueprint` handed to `defineStoneApp` is the imperative one.
 *
 * @param options - The validation configuration. Everything is optional.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { Validation } from '@stone-js/validation'
 *
 * @Validation({ schemas: { listQuery: ListQuerySchema } })
 * @StoneApp({ name: 'my-app' })
 * export class Application {}
 * ```
 */
export const Validation = <T extends ClassType = ClassType>(options: ValidationDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // The blueprint is the single source of truth for what the module declares; the decorator only
    // overrides what it can, its options bucket. Cloning is what lets it: two decorated applications
    // get their own copy instead of sharing the exported constant.
    const blueprint = cloneValue(validationBlueprint)

    blueprint.stone.validation = { ...blueprint.stone.validation, ...options }

    addBlueprint(target, context, blueprint)
  })
}
