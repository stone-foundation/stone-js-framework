import { File } from '@stone-js/filesystem'
import { IBlueprint } from '@stone-js/core'
import { JsonResponse } from '../src/JsonResponse'
import { JsonpResponse } from '../src/JsonpResponse'
import { RedirectResponse } from '../src/RedirectResponse'
import { IncomingHttpEvent } from '../src/IncomingHttpEvent'
import { BinaryFileResponse } from '../src/BinaryFileResponse'
import { OutgoingHttpResponse } from '../src/OutgoingHttpResponse'
import { HTTP_OK, HTTP_NO_CONTENT, HTTP_BAD_REQUEST, HTTP_INTERNAL_SERVER_ERROR, HTTP_UNAUTHORIZED, HTTP_FORBIDDEN, HTTP_NOT_FOUND, HTTP_SERVICE_UNAVAILABLE, HTTP_METHOD_NOT_ALLOWED } from '../src/constants'
import { badRequestHttpResponse, createHttpResponse, emptyHttpResponse, fileHttpResponse, forbiddenHttpResponse, htmlHttpResponse, jsonHttpResponse, jsonpHttpResponse, methodNotAllowedHttpResponse, noContentHttpResponse, notFoundHttpResponse, okHttpResponse, redirectHttpResponse, serverErrorHttpResponse, unauthorizedHttpResponse, unavailableHttpResponse } from '../src/HttpResponse'

// Unit tests for the HttpResponse utility functions
describe('HttpResponse', () => {
  const event = IncomingHttpEvent.create({ url: new URL('http://localhost'), ip: '127.0.0.1', source: {} as any })

  it('should create a basic OutgoingHttpResponse', async () => {
    const blueprint = {
      get: vi.fn(() => undefined)
    } as unknown as IBlueprint
    // @ts-expect-error - Testing private property
    event.protocol = 'https'
    const response = await createHttpResponse('Hello World', HTTP_OK)
      .setCookie('username', 'Jonh')
      .prepare(event, { make: () => blueprint } as any)
    expect(response).toBeInstanceOf(OutgoingHttpResponse)
    expect(response.statusCode).toBe(HTTP_OK)
    expect(response.content).toBe('Hello World')
    // 'Hello World' has no HTML markup, so it is now served as text/plain
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
  })

  it('should create an OK response', async () => {
    const response = await okHttpResponse('All Good', { 'Content-Type': 'text/plain' }).prepare(event)
    expect(response.statusCode).toBe(HTTP_OK)
    expect(response.content).toBe('All Good')
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
  })

  it('should create a No Content response', async () => {
    const response = await noContentHttpResponse().prepare(event)
    expect(response.statusCode).toBe(HTTP_NO_CONTENT)
    expect(response.content).toBeFalsy()
  })

  it('should create a Bad Request response', async () => {
    const response = await badRequestHttpResponse('Bad Request').prepare(event)
    expect(response.statusCode).toBe(HTTP_BAD_REQUEST)
    expect(response.content).toBe('Bad Request')
  })

  it('should create a Unauthorized response', async () => {
    const response = await unauthorizedHttpResponse('Unauthorized').prepare(event)
    expect(response.statusCode).toBe(HTTP_UNAUTHORIZED)
    expect(response.content).toBe('Unauthorized')
  })

  it('should create a Forbidden response', async () => {
    const response = await forbiddenHttpResponse('Forbidden').prepare(event)
    expect(response.statusCode).toBe(HTTP_FORBIDDEN)
    expect(response.content).toBe('Forbidden')
  })

  it('should create a Not Found response', async () => {
    const response = await notFoundHttpResponse('Not Found').prepare(event)
    expect(response.statusCode).toBe(HTTP_NOT_FOUND)
    expect(response.content).toBe('Not Found')
  })

  it('should create a Method Not Allowed response', async () => {
    const response = await methodNotAllowedHttpResponse('Method Not Allowed').prepare(event)
    expect(response.statusCode).toBe(HTTP_METHOD_NOT_ALLOWED)
    expect(response.content).toBe('Method Not Allowed')
  })

  it('should create a Service Unavailable response', async () => {
    const response = await unavailableHttpResponse('Service Unavailable').prepare(event)
    expect(response.statusCode).toBe(HTTP_SERVICE_UNAVAILABLE)
    expect(response.content).toBe('Service Unavailable')
  })

  it('should create a HTML response', async () => {
    const response = await htmlHttpResponse('<h1>Hello</h1>').prepare(event)
    expect(response).toBeInstanceOf(OutgoingHttpResponse)
    expect(response.statusCode).toBe(HTTP_OK)
    expect(response.content).toEqual('<h1>Hello</h1>')
  })

  it('should create an empty response', async () => {
    const response = await emptyHttpResponse().prepare(event)
    expect(response).toBeInstanceOf(OutgoingHttpResponse)
    expect(response.statusCode).toBe(HTTP_NO_CONTENT)
    expect(response.content).toBeFalsy()
  })

  it('should create a JSON response', async () => {
    const response = await jsonHttpResponse({ key: 'value' }).prepare(event)
    expect(response).toBeInstanceOf(JsonResponse)
    expect(response.statusCode).toBe(HTTP_OK)
    expect(response.content).toEqual('{"key":"value"}')
  })

  it('should create a JSONP response', async () => {
    const response = await jsonpHttpResponse({ key: 'value' }).setCallback('callback').prepare(event)
    expect(response).toBeInstanceOf(JsonpResponse)
    expect(response.statusCode).toBe(HTTP_OK)
    expect(response.content).toEqual("/**/ typeof callback === 'function' && callback({\"key\":\"value\"});")
  })

  it('should create a File response', async () => {
    const file = File.create('test.txt', false)
    file.isReadable = vi.fn().mockReturnValue(true)
    file.getHashedContent = vi.fn().mockReturnValue('test')
    file.getMTime = vi.fn().mockReturnValue(1234567890)
    file.getPath = vi.fn().mockReturnValue('test.txt')
    file.getMimeType = vi.fn().mockReturnValue('text/plain')
    file.getSize = vi.fn().mockReturnValue(10)
    file.getContent = vi.fn().mockReturnValue('test')
    const response = await fileHttpResponse(file).prepare(event)
    expect(response).toBeInstanceOf(BinaryFileResponse)
    expect(response.statusCode).toBe(HTTP_OK)
    expect(response.file).toBe(file)
  })

  it('should create a Redirect response', async () => {
    const response = await redirectHttpResponse('http://example.com').prepare(event)
    expect(response).toBeInstanceOf(RedirectResponse)
    expect(response.statusCode).toBe(302)
    expect(response.headers.get('Location')).toBe('http://example.com')
  })

  it('should detect HTML markup in a string and set text/html', async () => {
    const response = await okHttpResponse('<div>Hello</div>').prepare(event)
    expect(response.statusCode).toBe(HTTP_OK)
    expect(response.content).toBe('<div>Hello</div>')
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
  })

  it('should create a Server Error response', async () => {
    const response = await serverErrorHttpResponse('Internal Server Error').prepare(event)
    expect(response.statusCode).toBe(HTTP_INTERNAL_SERVER_ERROR)
    expect(response.content).toBe('Internal Server Error')
  })
})
