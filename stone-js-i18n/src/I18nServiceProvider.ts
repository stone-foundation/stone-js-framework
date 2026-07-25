import { I18n } from './I18n'
import { I18nOptions } from './declarations'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'

/**
 * Wires i18n into the container.
 *
 * It builds the {@link I18n} service from `stone.i18n`, publishes it process-wide (so the standalone
 * `t()` helper works), and binds it as `i18n`/`I18n` for injection: `constructor ({ i18n })`.
 */
export class I18nServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the i18n service.
   */
  register (): Promiseable<void> {
    const options = this.container.make<IBlueprint>('blueprint').get<I18nOptions>('stone.i18n', {})
    const i18n = I18n.create(options)

    I18n.setInstance(i18n)

    this.container
      .instanceIf(I18n, i18n)
      .alias(I18n, ['i18n', 'I18n'])
      .instanceIf('i18next', i18n.raw) // the raw i18next instance, for direct use
  }
}
