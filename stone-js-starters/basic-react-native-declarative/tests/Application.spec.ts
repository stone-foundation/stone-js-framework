import { stoneApp } from '@stone-js/core'
import { describe, it, expect, beforeAll } from 'vitest'
import { Application } from '../app/Application'
import { OutgoingBrowserResponse } from '@stone-js/browser-core'
import { nativeEventSource } from '../adapter/NativeEventSource'
import { WelcomeData, WelcomeController } from '../app/WelcomeController'
import { onNativeError, onNativeRender } from '../adapter/renderSink'
import { nativeAdapterBlueprint } from '../adapter/nativeAdapterBlueprint'

/**
 * Behavioral test of the full continuum chain: the exact modules the native
 * application boots (domain + router + native adapter) are booted here under
 * Node, navigation intents are emitted, and the rendered payloads asserted.
 *
 * The adapter is pure JavaScript, so what passes here is what runs on device;
 * only the platform checks (URL polyfill, Hermes) need the real application.
 *
 * The application boots ONCE for the whole suite, like on a device: default
 * blueprints are shared module-level objects, so booting the same modules
 * twice in one process would accumulate route definitions.
 */
describe('Stone.js native proof of concept', () => {
  const rendered: OutgoingBrowserResponse[] = []
  const errors: Error[] = []

  beforeAll(async () => {
    onNativeRender((response) => rendered.push(response))
    onNativeError((error) => errors.push(error))
    await stoneApp({ modules: [Application, WelcomeController, nativeAdapterBlueprint] }).run()
  })

  it('boots and renders the landing route on startup', () => {
    expect(errors).toHaveLength(0)
    expect(rendered).toHaveLength(1)

    const payload = rendered[0].content as WelcomeData
    expect(payload.route).toBe('/')
    expect(payload.message).toContain('Welcome to Stone.js on React Native!')
    expect(payload.framework.name).toBe('Stone.js')
  })

  it('routes a navigation intent with a parameter to the same domain', async () => {
    nativeEventSource.navigate('stone://app/hello/Noowow')
    await new Promise((resolve) => setImmediate(resolve))

    const payload = rendered.at(-1)?.content as WelcomeData
    expect(payload.route).toBe('/hello/Noowow')
    expect(payload.message).toContain('Hello Noowow!')
  })

  it('decodes encoded route parameters', async () => {
    nativeEventSource.navigate('stone://app/hello/Mr.%20Stone')
    await new Promise((resolve) => setImmediate(resolve))

    const payload = rendered.at(-1)?.content as WelcomeData
    expect(payload.message).toContain('Hello Mr. Stone!')
  })

  it('surfaces unknown routes through the error chain instead of crashing', async () => {
    nativeEventSource.navigate('stone://app/nowhere')
    await new Promise((resolve) => setImmediate(resolve))

    const lastPayload = rendered.at(-1)?.content as WelcomeData | undefined
    expect(lastPayload?.route === '/nowhere').toBe(false)
  })
})
