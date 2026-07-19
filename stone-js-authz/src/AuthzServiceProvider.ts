import { Authorizer } from './Authorizer'
import { AuthzOptions } from './declarations'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'

/**
 * Registers the {@link Authorizer} service (singleton) from `stone.authz` config, aliased as
 * `authorizer`/`Authorizer`, so middleware, guards and handlers can resolve it.
 */
export class AuthzServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the authorization service.
   */
  register (): Promiseable<void> {
    const options = this.container.make<IBlueprint>('blueprint').get<AuthzOptions>('stone.authz', {})

    this.container
      .singletonIf(Authorizer, () => Authorizer.create(options.resolveAbility))
      .alias(Authorizer, ['authorizer', 'Authorizer'])
  }
}
