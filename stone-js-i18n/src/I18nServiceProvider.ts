import { I18nManager } from './I18nManager'
import { I18nOptions } from './declarations'
import { IBlueprint, IContainer, ILogger, IServiceProvider, Promiseable } from '@stone-js/core'

/**
 * Wires i18n into the container.
 *
 * It builds the {@link I18nManager} service from `stone.i18n`, publishes it process-wide (so the standalone
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
    const i18n = I18nManager.create(options)

    this.warnWhenNothingToTranslate(options)

    I18nManager.setInstance(i18n)

    this.container
      .instanceIf(I18nManager, i18n)
      .alias(I18nManager, ['i18n', 'I18n'])
      .instanceIf('i18next', i18n.raw) // the raw i18next instance, for direct use
  }

  /**
   * Say it out loud when there is nothing to translate with.
   *
   * A translation module with no catalogs does not fail: `t('SOME_KEY')` answers `SOME_KEY`, which
   * reads like a missing entry rather than a missing module, passes every in-process test, passes the
   * build, and reaches production in the user's language. That silence is the worst part of the
   * failure, so it ends here: no resources, no lazy loaders, one line on the log.
   *
   * @param options - The i18n options as configured.
   */
  private warnWhenNothingToTranslate (options: I18nOptions): void {
    const hasResources = Object.keys(options.resources ?? {}).length > 0
    const hasLoaders = Object.keys(options.loaders ?? {}).length > 0

    if (hasResources || hasLoaders) { return }

    this.container.make<ILogger>('logger')?.warn(
      '[@stone-js/i18n] No catalogs registered: every key will be returned as-is. Either the scan found ' +
      'nothing under `app/**/i18n/<locale>/<namespace>.*`, or the build plugin did not run (check that ' +
      '`@stone-js/i18n` is a direct dependency and that `stone.builder.autoDiscover` is not `false`), ' +
      'or `stone.i18n.resources` was set to an empty map.'
    )
  }
}
