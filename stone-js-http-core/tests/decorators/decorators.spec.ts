/* eslint-disable @typescript-eslint/no-extraneous-class */

import { JsonResponse } from '../../src/JsonResponse'
import { JsonpResponse } from '../../src/JsonpResponse'
import { RedirectResponse } from '../../src/RedirectResponse'
import { HttpResponse } from '../../src/decorators/HttpResponse'
import { BinaryFileResponse } from '../../src/BinaryFileResponse'
import { OkHttpResponse } from '../../src/decorators/OkHttpResponse'
import { OutgoingHttpResponse } from '../../src/OutgoingHttpResponse'
import { FileHttpResponse } from '../../src/decorators/FileHttpResponse'
import { HtmlHttpResponse } from '../../src/decorators/HtmlHttpResponse'
import { JsonHttpResponse } from '../../src/decorators/JsonHttpResponse'
import { JsonpHttpResponse } from '../../src/decorators/JsonpHttpResponse'
import { RedirectHttpResponse } from '../../src/decorators/RedirectHttpResponse'
import { NoContentHttpResponse } from '../../src/decorators/NoContentHttpResponse'

describe('Decorators', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FileHttpResponse', () => {
    it('should return a BinaryFileResponse', async () => {
      BinaryFileResponse.prototype.autoEtag = vi.fn()
      BinaryFileResponse.prototype.autoLastModified = vi.fn()
      BinaryFileResponse.prototype.setContentDisposition = vi.fn()
      // @ts-expect-error - ignore type checking for testing purposes
      BinaryFileResponse.prototype.getValidatedFile = vi.fn((file) => file)
      const method = FileHttpResponse()(() => 'file', { name: 'save', kind: 'method' } as any, {}) as () => Promise<BinaryFileResponse>
      const response = await method()
      expect(response).toBeInstanceOf(BinaryFileResponse)
      expect(response.statusCode).toBe(200)
      expect(response.headers.keys.length).toBe(0)
      expect(response.content).toBeUndefined()
      expect(response.file).toBe('file')
    })
  })

  describe('NoContentHttpResponse', () => {
    it('should return an OutgoingHttpResponse with no content', async () => {
      const method = NoContentHttpResponse()(() => ({ name: 'John Doe' }), { name: 'save', kind: 'method' } as any, {}) as () => Promise<OutgoingHttpResponse>
      const response = await method()
      expect(response).toBeInstanceOf(OutgoingHttpResponse)
      expect(response.statusCode).toBe(204)
      expect(response.headers.keys.length).toBe(0)
      expect(response.content).toBeUndefined()
    })
  })

  describe('HtmlHttpResponse', () => {
    it('should return an html OutgoingHttpResponse', async () => {
      const method = HtmlHttpResponse()(() => '<h1>John Doe</h1>', { name: 'save', kind: 'method' } as any, {}) as () => Promise<OutgoingHttpResponse>
      const response = await method()
      expect(response).toBeInstanceOf(OutgoingHttpResponse)
      expect(response.statusCode).toBe(200)
      expect(response.headers.keys.length).toBe(0)
      expect(response.content).toBe('<h1>John Doe</h1>')
    })
  })

  describe('OkHttpResponse', () => {
    it('should return a 200 OutgoingHttpResponse', async () => {
      const method = OkHttpResponse()(() => '<h1>John Doe</h1>', { name: 'save', kind: 'method' } as any, {}) as () => Promise<OutgoingHttpResponse>
      const response = await method()
      expect(response).toBeInstanceOf(OutgoingHttpResponse)
      expect(response.statusCode).toBe(200)
      expect(response.headers.keys.length).toBe(0)
      expect(response.content).toBe('<h1>John Doe</h1>')
    })
  })

  describe('HttpResponse', () => {
    it('should return a 401 OutgoingHttpResponse', async () => {
      const method = HttpResponse(401)(() => ({ message: 'error' }), { name: 'save', kind: 'method' } as any, {}) as () => Promise<OutgoingHttpResponse>
      const response = await method()
      expect(response).toBeInstanceOf(OutgoingHttpResponse)
      expect(response.is4xx()).toBe(true)
      expect(response.statusCode).toBe(401)
      expect(response.headers.keys.length).toBe(0)
      expect(response.content).toEqual({ message: 'error' })
    })
  })

  describe('JsonHttpResponse', () => {
    it('should return a JsonResponse', async () => {
      const method = JsonHttpResponse()(() => ({ name: 'John Doe' }), { name: 'save', kind: 'method' } as any, {}) as () => Promise<JsonResponse>
      const response = await method()
      expect(response).toBeInstanceOf(JsonResponse)
      expect(response.statusCode).toBe(200)
      expect(response.headers.keys.length).toBe(0)
      expect(response.content).toEqual({ name: 'John Doe' })
    })
  })

  describe('JsonpHttpResponse', () => {
    it('should return a JsonpResponse', async () => {
      const method = JsonpHttpResponse()(() => ({ name: 'John Doe' }), { name: 'save', kind: 'method' } as any, {}) as () => Promise<JsonpResponse>
      const response = await method()
      expect(response).toBeInstanceOf(JsonpResponse)
      expect(response.statusCode).toBe(200)
      expect(response.headers.keys.length).toBe(0)
      expect(response.content).toEqual({ name: 'John Doe' })
    })
  })

  describe('RedirectHttpResponse', () => {
    it('should return a RedirectResponse', async () => {
      const method = RedirectHttpResponse(301)(() => 'https://stonejs.dev', { name: 'save', kind: 'method' } as any, {}) as () => Promise<RedirectResponse>
      const response = await method()
      expect(response).toBeInstanceOf(RedirectResponse)
      expect(response.statusCode).toBe(301)
      expect(response.headers.keys.length).toBe(0)
      // @ts-expect-error - ignore type checking for testing purposes
      expect(response.targetUrl).toEqual('https://stonejs.dev')
    })
  })
})
