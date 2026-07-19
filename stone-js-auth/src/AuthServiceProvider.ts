import { Authenticator } from './Authenticator'
import { AuthOptions } from './declarations'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'

/**
 * Registers the {@link Authenticator} service (singleton) from `stone.auth` config, aliased as
 * `authenticator`/`Authenticator`, so middleware, guards and handlers can resolve it.
 */
export class AuthServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the authentication service.
   */
  register (): Promiseable<void> {
    const options = this.container.make<IBlueprint>('blueprint').get<AuthOptions>('stone.auth', {})

    this.container
      .singletonIf(Authenticator, () => Authenticator.create(options))
      .alias(Authenticator, ['authenticator', 'Authenticator'])
  }
}
