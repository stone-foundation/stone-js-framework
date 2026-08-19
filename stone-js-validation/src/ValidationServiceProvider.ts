import { Validator } from './Validator'
import { ValidationOptions } from './declarations'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'

/**
 * Registers the {@link Validator} service (singleton) in the container, aliased as
 * `validator`/`Validator`, so middleware, handlers and services can resolve it.
 *
 * It also binds whatever schema engines the application declared under
 * `stone.validation.engines`, so a schema class can take its engine through its constructor:
 * `constructor ({ zod })`. That is more elegant than importing the library at every schema, and more
 * testable, since a test hands the class a fake instead of mocking a module.
 *
 * The application names the engine; this module never imports one. That is what keeps it agnostic:
 * Zod, Valibot and ArkType arrive through Standard Schema, and a native schema needs no engine at all.
 */
export class ValidationServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the validation service and any declared schema engine.
   */
  register (): Promiseable<void> {
    this.container
      .singletonIf(Validator, () => Validator.create())
      .alias(Validator, ['validator', 'Validator'])

    const engines = this.container
      .make<IBlueprint>('blueprint')
      .get<ValidationOptions>('stone.validation', {})
      .engines ?? {}

    for (const [name, engine] of Object.entries(engines)) {
      // `instanceIf` so an application that already bound the name keeps its own binding.
      this.container.instanceIf(name, engine as any)
    }
  }
}
