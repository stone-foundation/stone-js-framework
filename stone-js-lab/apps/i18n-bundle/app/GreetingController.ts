import { I18nManager } from '@stone-js/i18n'
import { EventHandler, Get } from '@stone-js/router'
import { IncomingHttpEvent } from '@stone-js/http-core'

/**
 * Two routes: one translated off the event, one translated by an injected i18n that never sees it.
 */
@EventHandler('/')
export class GreetingController {
  private readonly i18n: I18nManager

  constructor ({ i18n }: { i18n: I18nManager }) {
    this.i18n = i18n
  }

  @Get('/greeting')
  greeting (event: IncomingHttpEvent): { text: string } {
    return { text: event.getMetadataValue<I18nManager>('i18n').t('common:greeting') }
  }

  @Get('/injected')
  injected (): { text: string, locale: string } {
    // Never handed the event: this is what used to answer in the configured locale whatever the
    // caller asked for.
    return { text: this.i18n.t('common:greeting'), locale: this.i18n.getLocale() }
  }
}
