import { I18n } from '@stone-js/i18n'
import { Telemetry } from '@stone-js/telemetry'
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { NodeHttp } from '@stone-js/node-http-adapter'

/**
 * Application: the smallest app that proves auto-discovered translations survive a bundle.
 */
@Telemetry()
@I18n()
@Routing()
@StoneApp({ name: 'i18n-bundle' })
@NodeHttp({ default: true, url: 'http://localhost:4599' })
export class Application {}
