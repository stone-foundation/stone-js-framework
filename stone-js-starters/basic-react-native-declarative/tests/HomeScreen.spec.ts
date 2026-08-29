import { createTestApp } from '@stone-js/testing'
import { makeIncomingBrowserEvent } from '@stone-js/testing/browser'
import { REACT_NATIVE_PLATFORM } from '@stone-js/react-native-adapter'

/**
 * The whole application, booted in memory and asked a real question.
 *
 * Nothing is mocked and nothing is listed: `createTestApp()` discovers `app/**`, and the event goes
 * through the same kernel a phone runs. This is the same test the web starters ship, with one
 * difference: the platform is named, and the event is the one a native application receives, which
 * is how a deep link arrives.
 *
 * What it substitutes is the adapter, and that is the architecture rather than a concession to
 * testing: the domain is written once and the context is chosen at run time, so under Node the
 * context is a test adapter instead of React Native.
 */
describe('HomeScreen', () => {
  it('resolves the home screen, data included', async () => {
    const app = await createTestApp({ platform: REACT_NATIVE_PLATFORM })

    const response = await app.send(makeIncomingBrowserEvent({ url: 'stone://?name=Ada' }))

    expect(response.statusCode).toBe(200)
    // The head is what a navigator shows in its header, and it proves the loader ran with the deep
    // link's parameter.
    expect((response.content as any).head.title).toBe('Ada · Welcome to Stone.js')
  })

  it('resolves without a name', async () => {
    const app = await createTestApp({ platform: REACT_NATIVE_PLATFORM })

    const response = await app.send(makeIncomingBrowserEvent({ url: 'stone://' }))

    expect(response.statusCode).toBe(200)
  })
})
