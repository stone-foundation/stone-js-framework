import { createTestApp } from '@stone-js/testing'
import { makeIncomingBrowserEvent } from '@stone-js/testing/browser'
import { REACT_NATIVE_PLATFORM } from '@stone-js/react-native-adapter'

/**
 * The mobile application, booted in memory and asked the same questions the web one is asked.
 *
 * Read it next to `apps/web/tests/TaskListPage.spec.ts`. Same domain, same assertions, same counts,
 * through two different contexts. That is the claim this repository exists to demonstrate, and it is
 * visible in the tests rather than only in the source.
 *
 * `createTestApp()` discovers `app/**` and substitutes the adapter, which is the architecture rather
 * than a concession to testing: the domain is written once and the context is chosen at run time, so
 * under Node the context is a test adapter instead of React Native. What a native application does
 * differently, its navigation stack, is `tests/navigation.spec.ts`.
 */
describe('TaskListScreen', () => {
  it('resolves the task list from the shared domain', async () => {
    const app = await createTestApp({ platform: REACT_NATIVE_PLATFORM })

    const response = await app.send(makeIncomingBrowserEvent({ url: 'acme://app/' }))

    expect(response.statusCode).toBe(200)
    // The head is what a navigator shows in its header, and it carries the count the domain computed.
    expect((response.content as any).head.title).toBe('1 left · Acme tasks')
  })

  it('toggles a task through the same domain the web app uses', async () => {
    const app = await createTestApp({ platform: REACT_NATIVE_PLATFORM })

    const response = await app.send(makeIncomingBrowserEvent({ url: 'acme://app/?toggle=3' }))

    expect(response.statusCode).toBe(200)
    expect((response.content as any).head.title).toBe('0 left · Acme tasks')
  })
})
