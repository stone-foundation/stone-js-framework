import { normalizeWebRequest } from '@stone-js/http-core'
import { IP_HEADERS } from '../src/constants'

describe('the headers an edge runtime is trusted for', () => {
  it('prefers the one Cloudflare own edge overwrites', async () => {
    // A forwarded header nothing overwrites is client-spoofable, so the order is not cosmetic: it is
    // which header this platform guarantees. The normalising itself lives in `@stone-js/http-core`,
    // tested there; what belongs here is the choice.
    expect(IP_HEADERS[0]).toBe('cf-connecting-ip')

    const request = new Request('https://api.test/', {
      headers: { 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '9.9.9.9' }
    })

    expect((await normalizeWebRequest(request, IP_HEADERS)).ip).toBe('1.1.1.1')
  })

  it('falls back through the generic ones an edge may set instead', async () => {
    expect(IP_HEADERS).toEqual(['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for'])

    const request = new Request('https://api.test/', { headers: { 'x-real-ip': '2.2.2.2' } })

    expect((await normalizeWebRequest(request, IP_HEADERS)).ip).toBe('2.2.2.2')
  })
})
