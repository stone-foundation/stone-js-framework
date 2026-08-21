import { BROWSER_PLATFORM } from '@stone-js/browser-adapter'
import { createTestApp, makeIncomingHttpEvent } from '@stone-js/testing'

describe('probe', () => {
  it('renders the probe page', async () => {
    const app = await createTestApp({ platform: BROWSER_PLATFORM })
    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/probe' }))
    console.log('HAS CONTENT:', String(response.html()).includes('Acme tasks'))
  })
})
