import { I18nManager } from '@stone-js/i18n'
import { EventHandler, Get, Post, Delete } from '@stone-js/router'
import { IncomingHttpEvent } from '@stone-js/http-core'

/**
 * One translated route, plus the two shapes of a declared response: the lab is where these are
 * exercised against a real server rather than a stub.
 */
@EventHandler('/')
export class GreetingController {
  @Get('/greeting')
  greeting (event: IncomingHttpEvent): { text: string } {
    const i18n = event.getMetadataValue<I18nManager>('i18n')
    return { text: i18n.t('common:greeting') }
  }

  @Post('/tasks', { response: { type: 'json', status: 201, headers: { 'X-Lab': 'declared' } } })
  create (): { id: number } {
    return { id: 7 }
  }

  @Delete('/tasks/7', { response: { type: 'no-content' } })
  remove (): void {}
}
