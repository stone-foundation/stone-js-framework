import { Validator } from './Validator'
import { IContainer, IServiceProvider, Promiseable } from '@stone-js/core'

/**
 * Registers the {@link Validator} service (singleton) in the container, aliased as
 * `validator`/`Validator`, so middleware, handlers and services can resolve it.
 */
export class ValidationServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the validation service.
   */
  register (): Promiseable<void> {
    this.container
      .singletonIf(Validator, () => Validator.create())
      .alias(Validator, ['validator', 'Validator'])
  }
}
