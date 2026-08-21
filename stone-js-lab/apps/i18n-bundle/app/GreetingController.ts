import { I18nManager } from '@stone-js/i18n'
import { EventHandler, Get } from '@stone-js/router'
import { IncomingHttpEvent } from '@stone-js/http-core'

/**
 * One route, one translated string: everything this lab app needs to say whether the catalogs
 * travelled with the artefact or stayed behind in the source tree.
 */
@EventHandler('/')
export class GreetingController {
  @Get('/greeting')
  greeting (event: IncomingHttpEvent): { text: string } {
    const i18n = event.getMetadataValue<I18nManager>('i18n')
    return { text: i18n.t('common:greeting') }
  }
}
