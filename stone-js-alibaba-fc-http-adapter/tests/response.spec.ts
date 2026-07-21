import { RawResponseWrapper } from '../src/RawResponseWrapper'
import { AlibabaFcHttpResponse } from '../src/declarations'
import { ServerResponseMiddleware } from '../src/middleware/ServerResponseMiddleware'
import { AlibabaFcHttpAdapterError } from '../src/errors/AlibabaFcHttpAdapterError'

const fcResponse = (): AlibabaFcHttpResponse & { statusCode?: number, headers: Record<string, string | string[]>, body?: string | Buffer } => {
  const resp: any = {
    statusCode: undefined,
    headers: {},
    body: undefined,
    setStatusCode (code: number) { resp.statusCode = code },
    setHeader (key: string, value: string | string[]) { resp.headers[key] = value },
    send (body?: string | Buffer) { resp.body = body }
  }
  return resp
}

describe('RawResponseWrapper', () => {
  it('writes status, headers and body onto the FC response', () => {
    const resp = fcResponse()
    RawResponseWrapper.create(resp, { status: 201, statusText: 'Created', headers: { 'content-type': 'application/json' }, body: '{"ok":true}' }).respond()
    expect(resp.statusCode).toBe(201)
    expect(resp.headers['content-type']).toBe('application/json')
    expect(resp.body).toBe('{"ok":true}')
  })

  it('defaults to 500 and no body, and sets a single Set-Cookie as a string', () => {
    const resp = fcResponse()
    RawResponseWrapper.create(resp, { cookies: ['a=1'] }).respond()
    expect(resp.statusCode).toBe(500)
    expect(resp.body).toBeUndefined()
    expect(resp.headers['Set-Cookie']).toBe('a=1')
  })

  it('sets multiple Set-Cookie values as an array (repeated headers)', () => {
    const resp = fcResponse()
    RawResponseWrapper.create(resp, { cookies: ['a=1', 'b=2'] }).respond()
    expect(resp.headers['Set-Cookie']).toEqual(['a=1', 'b=2'])
  })

  it('coerces byte bodies to a Buffer for send()', () => {
    const resp = fcResponse()
    RawResponseWrapper.create(resp, { status: 200, body: new Uint8Array([1, 2, 3]) }).respond()
    expect(Buffer.isBuffer(resp.body)).toBe(true)
    expect(Array.from(resp.body as Buffer)).toEqual([1, 2, 3])
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
    await expect(mw.handle({} as any, (async () => ({})) as any)).rejects.toThrow(AlibabaFcHttpAdapterError)
  })
})
