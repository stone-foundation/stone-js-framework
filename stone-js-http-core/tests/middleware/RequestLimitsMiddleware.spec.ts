import { IBlueprint } from '@stone-js/core'
import { HttpError } from '../../src/errors/HttpError'
import { IncomingHttpEvent } from '../../src/IncomingHttpEvent'
import { CookieCollection } from '../../src/cookies/CookieCollection'
import { RequestLimitsMiddleware } from '../../src/middleware/RequestLimitsMiddleware'

const makeBlueprint = (limits: Record<string, number>): IBlueprint => ({
  get: vi.fn((key: string, fallback: number) => limits[key] ?? fallback)
} as unknown as IBlueprint)

const makeEvent = (headers: Record<string, string>, cookie?: string): IncomingHttpEvent =>
  IncomingHttpEvent.create({
    url: new URL('http://localhost/'),
    headers,
    cookies: CookieCollection.create(cookie)
  } as any)

const next = async (): Promise<any> => 'ok'

describe('RequestLimitsMiddleware', () => {
  it('passes through when within limits', async () => {
    const mw = new RequestLimitsMiddleware({ blueprint: makeBlueprint({ 'stone.http.limits.maxHeaders': 10, 'stone.http.limits.maxCookies': 10 }) })
    const result = await mw.handle(makeEvent({ a: '1', b: '2' }), next as any)
    expect(result).toBe('ok')
  })

  it('rejects too many headers with 431', async () => {
    const mw = new RequestLimitsMiddleware({ blueprint: makeBlueprint({ 'stone.http.limits.maxHeaders': 1 }) })
    await expect(mw.handle(makeEvent({ a: '1', b: '2', c: '3' }), next as any)).rejects.toMatchObject({ statusCode: 431 })
  })

  it('rejects too many cookies with 431', async () => {
    const mw = new RequestLimitsMiddleware({ blueprint: makeBlueprint({ 'stone.http.limits.maxCookies': 1 }) })
    await expect(mw.handle(makeEvent({}, 'a=1; b=2; c=3'), next as any)).rejects.toBeInstanceOf(HttpError)
  })

  it('disables checks when limits are 0', async () => {
    const mw = new RequestLimitsMiddleware({ blueprint: makeBlueprint({ 'stone.http.limits.maxHeaders': 0, 'stone.http.limits.maxCookies': 0 }) })
    const result = await mw.handle(makeEvent({ a: '1', b: '2', c: '3' }, 'a=1; b=2; c=3'), next as any)
    expect(result).toBe('ok')
  })
})
