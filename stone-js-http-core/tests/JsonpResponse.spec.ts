import { IBlueprint } from '@stone-js/core'
import { JsonpResponse } from '../src/JsonpResponse'
import { HttpError } from '../src/errors/HttpError'
import { IncomingHttpEvent } from '../src/IncomingHttpEvent'

describe('JsonpResponse', () => {
  it('should set the callback correctly', () => {
    const response = new JsonpResponse({ content: 'test' })
    response.setCallback('callbackName')
    expect(response.getCallback()).toBe('callbackName')
  })

  it('should set the first callback when given an array of callbacks', () => {
    const response = new JsonpResponse({ content: 'test' })
    response.setCallback(['callback1', 'callback2'])
    expect(response.getCallback()).toBe('callback1')
  })

  it('should get the callback from incomingEvent query if not explicitly set', async () => {
    const incomingEvent = IncomingHttpEvent.create({
      queryString: '?callback=dynamicCallback',
      ip: '127.0.0.1',
      source: {} as any,
      url: new URL('http://localhost')
    })
    const blueprint = {
      get: vi.fn().mockReturnValue('callback')
    } as unknown as IBlueprint

    const response = await JsonpResponse.create<JsonpResponse>({ content: { name: 'test' } }).prepare(incomingEvent, { make: () => blueprint } as any)

    expect(response.getCallback()).toBe('dynamicCallback')
    expect(blueprint.get).toHaveBeenCalledWith('stone.http.jsonp.callback.name')
  })

  it('should throw an error if no callback is provided', async () => {
    const incomingEvent = IncomingHttpEvent.create({
      ip: '127.0.0.1',
      source: {} as any,
      url: new URL('http://localhost')
    })
    const response = new JsonpResponse({ content: 'test' })
    await expect(async () => await response.prepare(incomingEvent)).rejects.toThrow(HttpError)
  })

  it('should set content type to application/javascript if callback is provided', () => {
    const response = new JsonpResponse({ content: { message: 'test' } })
    // @ts-expect-error - Testing private method
    response.setCallback('callbackName').makeJson()

    expect(response.getHeader('Content-Type')).toBe('application/javascript; charset=utf-8')
  })

  it('should set the content with sanitized callback', () => {
    const response = new JsonpResponse({ content: { message: 'test' } })
    // @ts-expect-error - Testing private method
    response.setCallback('callback<script>').makeJson()
    expect(response.content).toContain("/**/ typeof callback<script> === 'function' && callback<script>({\"message\":\"test\"});")
  })

  it('should correctly set the content when making JSONP', () => {
    const response = new JsonpResponse({ content: { message: 'Hello World' } })
    // @ts-expect-error - Testing private method
    response.setCallback('callbackName').makeJson()
    expect(response.content).toBe(
      "/**/ typeof callbackName === 'function' && callbackName({\"message\":\"Hello World\"});"
    )
  })
})
