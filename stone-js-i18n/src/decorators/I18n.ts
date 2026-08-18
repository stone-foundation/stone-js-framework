import { cloneValue } from '@stone-js/config'
import { I18nOptions } from '../declarations'
import { i18nBlueprint } from '../options/I18nBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@I18n` decorator: the `stone.i18n` bucket, every key optional.
 */
export interface I18nDecoratorOptions extends I18nOptions {}

/**
 * Class decorator: enable localization, declaratively.
 *
 * `@I18n()` is all a consumer writes. It registers the i18n service provider (so
 * `constructor ({ i18n })` works anywhere), installs the kernel middleware that resolves the request
 * locale, and lets the build scan `app/i18n/<locale>/<namespace>` on its own, lazily. Options are
 * only for narrowing the defaults: locales, fallback, a `:lang` route param, a time zone.

 *
 * @param options - The i18n configuration. Everything is optional.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { I18n } from '@stone-js/i18n'
 *
 * @I18n({ locales: ['en', 'fr'], fallbackLocale: 'en' })
 * @StoneApp({ name: 'app' })
 * export class Application {}
 * ```
 */
export const I18n = <T extends ClassType = ClassType>(options: I18nDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(i18nBlueprint)

    blueprint.stone.i18n = { ...blueprint.stone.i18n, ...options }

    addBlueprint(target, context, blueprint)
  })
}
