import { normalizeWebRequest } from '@stone-js/http-core'
import { IP_HEADERS } from '../src/constants'

describe('the headers the Azure front end is trusted for', () => {
  it('prefers the one Azure own front end sets', async () => {
    // A forwarded header nothing overwrites is client-spoofable, so the order is not cosmetic: it is
    // which header this platform guarantees. The normalising itself lives in `@stone-js/http-core`,
    // tested there; what belongs here is the choice.
    expect(IP_HEADERS[0]).toBe('x-forwarded-for')

    const request = new Request('https://api.test/', {
      headers: { 'x-forwarded-for': '9.9.9.9', 'x-real-ip': '2.2.2.2' }
    })

    expect((await normalizeWebRequest(request, IP_HEADERS)).ip).toBe('9.9.9.9')
  })

  it('falls back through the generic ones a front end may set instead', async () => {
    expect(IP_HEADERS).toEqual(['x-forwarded-for', 'x-real-ip', 'x-client-ip'])

    const request = new Request('https://api.test/', { headers: { 'x-client-ip': '3.3.3.3' } })

    expect((await normalizeWebRequest(request, IP_HEADERS)).ip).toBe('3.3.3.3')
  })
})
