import { Mock } from 'vitest'
import { gzip, brotliCompress, deflate } from 'node:zlib'
import { CompressionMiddleware } from '../../src/middleware/CompressionMiddleware'

vi.mock('node:zlib') // Mock zlib compression methods

describe('CompressionMiddleware', () => {
  let middleware: any

  beforeEach(() => {
    (gzip as unknown as Mock).mockClear()
    middleware = new CompressionMiddleware()
  })

  it('should compress content using gzip if the client supports it', async () => {
    const eventMock = { getHeader: vi.fn().mockReturnValue('gzip') }
    const nextMock = vi.fn().mockResolvedValue({
      content: 'This is a test content that is larger than 1KB.'.repeat(50), // >1KB
      setHeader: vi.fn(),
      setContent: vi.fn(),
      addVary: vi.fn(),
      removeHeader: vi.fn()
    })

    const compressedBuffer = Buffer.from('compressed content');
    (gzip as unknown as Mock).mockImplementation((_buffer, cb) => cb(null, compressedBuffer))

    const response = await middleware.handle(eventMock, nextMock)

    expect(eventMock.getHeader).toHaveBeenCalledWith('accept-encoding', '')
    expect(nextMock).toHaveBeenCalled()
    expect(gzip).toHaveBeenCalled()
    expect(response.addVary).toHaveBeenCalledWith('Accept-Encoding')
    expect(response.setHeader).toHaveBeenCalledWith('Content-Encoding', 'gzip')
    expect(response.removeHeader).toHaveBeenCalledWith('Content-Length')
    expect(response.setContent).toHaveBeenCalledWith(compressedBuffer)
  })

  it('should compress content using Brotli if the client supports it', async () => {
    const eventMock = { getHeader: vi.fn().mockReturnValue('br') }
    const nextMock = vi.fn().mockResolvedValue({
      content: Buffer.from('This is compressible content.'),
      setHeader: vi.fn(),
      setContent: vi.fn(),
      addVary: vi.fn(),
      removeHeader: vi.fn()
    })

    const compressedBuffer = Buffer.from('compressed content');
    (brotliCompress as unknown as Mock).mockImplementation((buffer, cb) => cb(null, compressedBuffer))

    const response = await middleware.handle(eventMock, nextMock)

    expect(eventMock.getHeader).toHaveBeenCalledWith('accept-encoding', '')
    expect(nextMock).toHaveBeenCalled()
    expect(brotliCompress).toHaveBeenCalled()
    expect(response.addVary).toHaveBeenCalledWith('Accept-Encoding')
    expect(response.setHeader).toHaveBeenCalledWith('Content-Encoding', 'br')
    expect(response.removeHeader).toHaveBeenCalledWith('Content-Length')
    expect(response.setContent).toHaveBeenCalledWith(compressedBuffer)
  })

  it('should skip compression if no encoding is supported', async () => {
    const eventMock = { getHeader: vi.fn().mockReturnValue('') }
    const nextMock = vi.fn().mockResolvedValue({
      content: Buffer.from('This is compressible content.'),
      setHeader: vi.fn(),
      setContent: vi.fn(),
      addVary: vi.fn(),
      removeHeader: vi.fn()
    })

    const response = await middleware.handle(eventMock, nextMock)

    expect(eventMock.getHeader).toHaveBeenCalledWith('accept-encoding', '')
    expect(nextMock).toHaveBeenCalled()
    expect(response.setContent).not.toHaveBeenCalled()
    expect(response.removeHeader).toHaveBeenCalledWith('Content-Length')
    expect(response.addVary).toHaveBeenCalledWith('Accept-Encoding')
  })

  it('should skip compression for content smaller than 1KB', async () => {
    const eventMock = { getHeader: vi.fn().mockReturnValue('gzip') }
    const nextMock = vi.fn().mockResolvedValue({
      content: 'Short content',
      setContent: vi.fn()
    })

    const response = await middleware.handle(eventMock, nextMock)

    expect(nextMock).toHaveBeenCalled()
    expect(response.setContent).not.toHaveBeenCalled()
    expect(gzip).not.toHaveBeenCalled()
  })

  it('should handle errors during compression gracefully for gzip', async () => {
    const eventMock = { getHeader: vi.fn().mockReturnValue('gzip') }
    const compressedBuffer = Buffer.from('This is compressible content.')
    const nextMock = vi.fn().mockResolvedValue({
      content: compressedBuffer,
      setHeader: vi.fn(),
      setContent: vi.fn(),
      addVary: vi.fn(),
      removeHeader: vi.fn()
    });

    (gzip as unknown as Mock).mockImplementation((buffer, cb) => cb(new Error('Compression error')))

    const response = await middleware.handle(eventMock, nextMock)

    expect(nextMock).toHaveBeenCalled()
    expect(gzip).toHaveBeenCalled()
    expect(response.removeHeader).toHaveBeenCalledWith('Content-Length')
    expect(response.addVary).toHaveBeenCalledWith('Accept-Encoding')
  })

  it('should handle errors during compression gracefully for deflate', async () => {
    const eventMock = { getHeader: vi.fn().mockReturnValue('deflate') }
    const compressedBuffer = Buffer.from('This is compressible content.')
    const nextMock = vi.fn().mockResolvedValue({
      content: compressedBuffer,
      setHeader: vi.fn(),
      setContent: vi.fn(),
      addVary: vi.fn(),
      removeHeader: vi.fn()
    });

    (deflate as unknown as Mock).mockImplementation((buffer, cb) => cb(new Error('Compression error')))

    const response = await middleware.handle(eventMock, nextMock)

    expect(nextMock).toHaveBeenCalled()
    expect(deflate).toHaveBeenCalled()
    expect(response.removeHeader).toHaveBeenCalledWith('Content-Length')
    expect(response.addVary).toHaveBeenCalledWith('Accept-Encoding')
  })

  it('should handle errors during compression gracefully for br', async () => {
    const eventMock = { getHeader: vi.fn().mockReturnValue('br') }
    const compressedBuffer = Buffer.from('This is compressible content.')
    const nextMock = vi.fn().mockResolvedValue({
      content: compressedBuffer,
      setHeader: vi.fn(),
      setContent: vi.fn(),
      addVary: vi.fn(),
      removeHeader: vi.fn()
    });

    (brotliCompress as unknown as Mock).mockImplementation((buffer, cb) => cb(new Error('Compression error')))

    const response = await middleware.handle(eventMock, nextMock)

    expect(nextMock).toHaveBeenCalled()
    expect(brotliCompress).toHaveBeenCalled()
    expect(response.removeHeader).toHaveBeenCalledWith('Content-Length')
    expect(response.addVary).toHaveBeenCalledWith('Accept-Encoding')
  })

  it('should compress content using deflate if the client supports it', async () => {
    const eventMock = { getHeader: vi.fn().mockReturnValue('deflate') }
    const nextMock = vi.fn().mockResolvedValue({
      content: Buffer.from('This is compressible content.'),
      setHeader: vi.fn(),
      setContent: vi.fn(),
      addVary: vi.fn(),
      removeHeader: vi.fn()
    })

    const compressedBuffer = Buffer.from('compressed content');
    (deflate as unknown as Mock).mockImplementation((buffer, cb) => cb(null, compressedBuffer))

    const response = await middleware.handle(eventMock, nextMock)

    expect(eventMock.getHeader).toHaveBeenCalledWith('accept-encoding', '')
    expect(nextMock).toHaveBeenCalled()
    expect(deflate).toHaveBeenCalled()
    expect(response.addVary).toHaveBeenCalledWith('Accept-Encoding')
    expect(response.setHeader).toHaveBeenCalledWith('Content-Encoding', 'deflate')
    expect(response.removeHeader).toHaveBeenCalledWith('Content-Length')
    expect(response.setContent).toHaveBeenCalledWith(compressedBuffer)
  })

  it('should skip compression if no valid encoding is provided', async () => {
    const eventMock = { getHeader: vi.fn().mockReturnValue('invalid-encoding') }
    const nextMock = vi.fn().mockResolvedValue({
      content: Buffer.from('This is compressible content.'),
      setHeader: vi.fn(),
      setContent: vi.fn(),
      addVary: vi.fn(),
      removeHeader: vi.fn()
    })

    const compressedBuffer = Buffer.from('compressed content');
    (gzip as unknown as Mock).mockImplementation((buffer, cb) => cb(null, compressedBuffer))

    const response = await middleware.handle(eventMock, nextMock)

    expect(eventMock.getHeader).toHaveBeenCalledWith('accept-encoding', '')
    expect(nextMock).toHaveBeenCalled()
    expect(gzip).not.toHaveBeenCalled()
    // No encoding negotiated → no Content-Encoding, but Vary is still merged and Content-Length dropped.
    expect(response.setHeader).not.toHaveBeenCalledWith('Content-Encoding', expect.anything())
    expect(response.addVary).toHaveBeenCalledWith('Accept-Encoding')
    expect(response.removeHeader).toHaveBeenCalled()
    expect(response.setContent).not.toHaveBeenCalled()
  })

  it('should not compress if the content is not compressible', async () => {
    const eventMock = { getHeader: vi.fn().mockReturnValue('gzip') }
    const nextMock = vi.fn().mockResolvedValue({
      content: null,
      setContent: vi.fn()
    })

    const response = await middleware.handle(eventMock, nextMock)

    expect(nextMock).toHaveBeenCalled()
    expect(response.setContent).not.toHaveBeenCalled()
    expect(gzip).not.toHaveBeenCalled()
  })
})
