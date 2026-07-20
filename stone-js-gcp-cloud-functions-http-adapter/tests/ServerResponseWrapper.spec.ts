import { ServerResponse } from 'node:http'
import { RawHttpResponseOptions } from '../src/declarations'
import { ServerResponseWrapper } from '../src/ServerResponseWrapper'

describe('ServerResponseWrapper', () => {
  let mockResponse: ServerResponse

  beforeEach(() => {
    // Mock the ServerResponse object
    mockResponse = {
      statusCode: 200,
      statusMessage: '',
      setHeaders: vi.fn(),
      end: vi.fn()
    } as unknown as ServerResponse
  })

  it('should create a new instance with default options', () => {
    const wrapper = ServerResponseWrapper.create(mockResponse)

    expect(wrapper).toBeInstanceOf(ServerResponseWrapper)
    expect(wrapper.response).toBe(mockResponse)
    expect(wrapper.options).toEqual({})
  })

  it('should set status code and message when options are provided', async () => {
    const options: Partial<RawHttpResponseOptions> = {
      statusCode: 404,
      statusMessage: 'Not Found',
      body: 'Hello, world!'
    }
    const wrapper = ServerResponseWrapper.create(mockResponse, options)

    const exitStatus = await wrapper.respond()

    expect(exitStatus).toBe(mockResponse)
    expect(mockResponse.statusCode).toBe(404)
    expect(mockResponse.statusMessage).toBe('Not Found')
  })

  it('should set headers when options are provided', async () => {
    const headers = new Map<string, string>([
      ['Content-Type', 'application/json']
    ])
    const options: Partial<RawHttpResponseOptions> = { headers }
    const wrapper = ServerResponseWrapper.create(mockResponse, options)

    await wrapper.respond()

    expect(mockResponse.setHeaders).toHaveBeenCalledWith(headers)
  })

  it('should stream file when streamFile option is provided', async () => {
    const streamFile = vi.fn().mockResolvedValue(undefined)
    const options: Partial<RawHttpResponseOptions> = { streamFile }
    const wrapper = ServerResponseWrapper.create(mockResponse, options)

    await wrapper.respond()

    expect(streamFile).toHaveBeenCalled()
    expect(mockResponse.end).not.toHaveBeenCalled()
  })

  it('should send body when body option is provided', async () => {
    const options: Partial<RawHttpResponseOptions> = {
      body: 'Hello, world!',
      charset: 'utf-8'
    }
    const wrapper = ServerResponseWrapper.create(mockResponse, options)

    await wrapper.respond()

    expect(mockResponse.end).toHaveBeenCalledWith('Hello, world!', 'utf-8')
  })

  it('should not modify status code, headers, or body if options are not provided', async () => {
    const wrapper = ServerResponseWrapper.create(mockResponse)

    await wrapper.respond()

    expect(mockResponse.statusCode).toBe(200) // Default value
    expect(mockResponse.setHeaders).not.toHaveBeenCalled()
    expect(mockResponse.end).toHaveBeenCalled()
  })

  it('should handle missing options gracefully', async () => {
    const options: Partial<RawHttpResponseOptions> = {
      streamFile: undefined,
      headers: undefined,
      body: undefined,
      statusCode: 200
    }
    const wrapper = ServerResponseWrapper.create(mockResponse, options)

    await wrapper.respond()

    expect(mockResponse.statusCode).toBe(200)
    expect(mockResponse.setHeaders).not.toHaveBeenCalled()
    expect(mockResponse.end).toHaveBeenCalled()
  })
})

describe('ServerResponseWrapper — streaming', () => {
  it('pipes a Web ReadableStream to the response', async () => {
    const { PassThrough } = await import('node:stream')
    const res = new PassThrough()
    const chunks: Buffer[] = []
    res.on('data', (c: Buffer) => chunks.push(c))

    const encoder = new TextEncoder()
    const webStream = new ReadableStream<Uint8Array>({
      start (controller) {
        controller.enqueue(encoder.encode('hello '))
        controller.enqueue(encoder.encode('stream'))
        controller.close()
      }
    })

    const wrapper = ServerResponseWrapper.create(res as any, { stream: webStream, statusCode: 200 })
    await wrapper.respond()

    expect(Buffer.concat(chunks).toString()).toBe('hello stream')
  })

  it('pipes a Node Readable to the response', async () => {
    const { PassThrough, Readable } = await import('node:stream')
    const res = new PassThrough()
    const chunks: Buffer[] = []
    res.on('data', (c: Buffer) => chunks.push(c))

    const source = Readable.from(['a', 'b', 'c'])
    const wrapper = ServerResponseWrapper.create(res as any, { stream: source as any })
    await wrapper.respond()

    expect(Buffer.concat(chunks).toString()).toBe('abc')
  })

  it('rejects and destroys the response when the source stream errors', async () => {
    const { PassThrough, Readable } = await import('node:stream')
    const res = new PassThrough()
    res.on('error', () => {}) // swallow the destroy-propagated error
    const destroySpy = vi.spyOn(res, 'destroy')

    const source = new Readable({
      read () { this.destroy(new Error('boom')) }
    })

    const wrapper = ServerResponseWrapper.create(res as any, { stream: source as any })
    await expect(wrapper.respond()).rejects.toThrow('boom')
    expect(destroySpy).toHaveBeenCalled()
  })
})
