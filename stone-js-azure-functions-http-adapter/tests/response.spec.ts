import { RawResponseWrapper } from '../src/RawResponseWrapper'
import { ServerResponseMiddleware } from '../src/middleware/ServerResponseMiddleware'
import { AzureFunctionsHttpAdapterError } from '../src/errors/AzureFunctionsHttpAdapterError'

describe('RawResponseWrapper', () => {
  it('builds an HttpResponseInit with status, headers and body', () => {
    const res = RawResponseWrapper.create({ status: 201, statusText: 'Created', headers: { 'content-type': 'application/json' }, body: '{"ok":true}' }).respond()
    expect(res.status).toBe(201)
    expect((res.headers as Headers).get('content-type')).toBe('application/json')
    expect(res.body).toBe('{"ok":true}')
  })

  it('defaults to 500 and no body, and appends multiple Set-Cookie', () => {
    const res = RawResponseWrapper.create({ cookies: ['a=1', 'b=2'] }).respond()
    expect(res.status).toBe(500)
    expect(res.body).toBeUndefined()
    const headers = res.headers as Headers
    const setCookies = typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : []
    expect(setCookies).toEqual(['a=1', 'b=2'])
  })
})

describe('ServerResponseMiddleware', () => {
  const makeContext = (over: any = {}): any => ({
    incomingEvent: { isMethod: (m: string) => m === 'HEAD' ? over.head === true : false },
    outgoingResponse: {
      statusCode: 200,
      statusMessage: undefined,
      content: '{"ok":true}',
      headers: new Headers({ 'content-type': 'application/json', 'set-cookie': 'sid=1' }),
      ...over.outgoing
    }
  })
  const builder = (): any => {
    const bag: any = { data: {}, add (k: string, v: unknown) { bag.data[k] = v; return bag } }
    return bag
  }

  it('maps status, headers, cookies and body; strips set-cookie from headers', async () => {
    const b = builder()
    const mw = new ServerResponseMiddleware()
    await mw.handle(makeContext(), (async () => b) as any)
    expect(b.data.status).toBe(200)
    expect(b.data.headers['content-type']).toBe('application/json')
    expect(b.data.headers['set-cookie']).toBeUndefined()
    expect(b.data.cookies).toEqual(['sid=1'])
    expect(b.data.body).toBe('{"ok":true}')
  })

  it('omits the body for HEAD requests', async () => {
    const b = builder()
    const mw = new ServerResponseMiddleware()
    await mw.handle(makeContext({ head: true }), (async () => b) as any)
    expect(b.data.body).toBeUndefined()
  })

  it('coerces bytes and objects, defaults status message', async () => {
    const b = builder()
    const mw = new ServerResponseMiddleware()
    await mw.handle(makeContext({ outgoing: { statusCode: 404, content: new Uint8Array([1]) } }), (async () => b) as any)
    expect(b.data.statusText).toBe('Not Found')
    expect(b.data.body).toBeInstanceOf(Uint8Array)
  })

  it('throws when the context is incomplete', async () => {
    const mw = new ServerResponseMiddleware()
    await expect(mw.handle({} as any, (async () => ({})) as any)).rejects.toThrow(AzureFunctionsHttpAdapterError)
  })
})
