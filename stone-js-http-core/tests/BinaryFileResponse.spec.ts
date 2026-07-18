import { IBlueprint } from '@stone-js/core'
import { HTTP_NOT_MODIFIED } from '../src/constants'
import contentDisposition from 'content-disposition'
import { IncomingHttpEvent } from '../src/IncomingHttpEvent'
import { File, FilesystemError } from '@stone-js/filesystem'
import { BinaryFileResponse, BinaryFileResponseOptions } from '../src/BinaryFileResponse'

// Mocking dependencies
vi.mock('../src/file/File')

describe('BinaryFileResponse', () => {
  const mockFile = {
    getEncodedPath: vi.fn().mockReturnValue('/encoded/path'),
    getHashedContent: vi.fn().mockReturnValue('hashedContent'),
    getMTime: vi.fn().mockReturnValue(1234567890),
    getSize: vi.fn().mockReturnValue(1024),
    getMimeType: vi.fn().mockReturnValue('application/octet-stream'),
    isReadable: vi.fn().mockReturnValue(true),
    getPath: vi.fn().mockReturnValue('/file/path'),
    isCompressed: vi.fn().mockReturnValue(false),
    getExtension: vi.fn().mockReturnValue('.gzip'),
    getContent: vi.fn().mockReturnValue(Buffer.from('file content'))
  }

  beforeEach(() => {
    (File as any).create = vi.fn().mockReturnValue(mockFile)
  })

  describe('constructor', () => {
    it('should create a BinaryFileResponse instance with valid options', () => {
      const options: BinaryFileResponseOptions = {
        file: '/file/path',
        autoEncoding: true,
        autoLastModified: true,
        content: ''
      }
      const response = new BinaryFileResponse(options)
      expect(response).toBeInstanceOf(BinaryFileResponse)
      expect(response.getEncodedFilePath()).toBe('/encoded/path')
      expect(response.setContent(undefined).getContent()).toBe(false)
    })

    it('should throw an error if the file is invalid', () => {
      const options: BinaryFileResponseOptions = {
        file: '/invalid/path',
        content: ''
      };
      (File.create as any).mockReturnValueOnce({ ...mockFile, isReadable: () => false })
      expect(() => new BinaryFileResponse(options)).toThrow(FilesystemError)
    })
  })

  describe('autoEtag', () => {
    it('should set the ETag header based on file content', () => {
      const options: BinaryFileResponseOptions = {
        file: '/file/path',
        autoEtag: true,
        content: ''
      }
      const response = new BinaryFileResponse(options)
      expect(response.getHeader('ETag')).toBe(`"${Buffer.from(mockFile.getHashedContent()).toString('base64')}"`)
    })
  })

  describe('autoEncoding', () => {
    it('should set the Content-Encoding header based on file extension', () => {
      const options: BinaryFileResponseOptions = {
        file: '/file/path',
        autoEncoding: true,
        content: ''
      }
      mockFile.isCompressed.mockReturnValue(true)
      const response = new BinaryFileResponse(options)
      expect(response.getHeader('Content-Encoding')).toBe('gzip')
    })
  })

  describe('autoLastModified', () => {
    it('should set the Last-Modified header based on file modification time', () => {
      const options: BinaryFileResponseOptions = {
        file: '/file/path',
        autoLastModified: true,
        content: ''
      }
      const response = new BinaryFileResponse(options)
      expect(response.getHeader('Last-Modified')).toBe(new Date(mockFile.getMTime()).toUTCString())
    })

    it('should set the Last-Modified header to the current time', () => {
      (File as any).create = vi.fn().mockReturnValue({
        ...mockFile,
        getMTime: vi.fn().mockReturnValue(undefined)
      })
      const options: BinaryFileResponseOptions = {
        file: '/file/path',
        autoLastModified: true,
        content: ''
      }
      const response = new BinaryFileResponse(options)
      expect(response.getHeader('Last-Modified')).toBe(new Date().toUTCString())
    })
  })

  describe('setContentDisposition', () => {
    it('should set Content-Disposition and Content-Type headers with file mimeType', () => {
      const options: BinaryFileResponseOptions = {
        file: '/file/path',
        contentDispositionType: 'attachment',
        content: ''
      }
      const response = BinaryFileResponse.file(options)
      expect(response.getHeader('Content-Type')).toBe(`${String(mockFile.getMimeType())}; charset=utf-8`)
      expect(response.getHeader('Content-Disposition')).toBe(contentDisposition(mockFile.getPath(), { type: 'inline' }))
    })

    it('should set Content-Disposition and Content-Type headers with the default', async () => {
      (File as any).create = vi.fn().mockReturnValue({
        ...mockFile,
        getSize: vi.fn().mockReturnValue(undefined),
        getMimeType: vi.fn().mockReturnValue(undefined)
      })
      const event = {
        isFresh: () => false
      } as unknown as IncomingHttpEvent
      const options: BinaryFileResponseOptions = {
        file: '/file/path',
        contentDispositionType: 'attachment',
        content: ''
      }
      const response = await BinaryFileResponse.download(options).prepare(event)
      expect(response.getHeader('Content-Type')).toBe('application/octet-stream; charset=utf-8')
      expect(response.getHeader('Content-Disposition')).toBe(contentDisposition(mockFile.getPath(), { type: 'attachment' }))
    })
  })

  describe('prepareContentHeaders', () => {
    it('should set ETag and Content-Type headers if not exist', async () => {
      const event = {
        isFresh: () => false
      } as unknown as IncomingHttpEvent;
      (File.create as any).mockReturnValueOnce({ ...mockFile, getMimeType: vi.fn().mockReturnValue(undefined) })

      const options: BinaryFileResponseOptions = {
        file: '/file/path',
        contentDispositionType: 'attachment',
        content: ''
      }

      const response = BinaryFileResponse.download(options)

      const blueprint = {
        // @ts-expect-error - Testing private method
        get: vi.fn(() => response.defaultEtagFn.bind(response))
      } as unknown as IBlueprint

      await response.removeHeader('Content-Type').prepare(event, { make: () => blueprint } as any)

      // Weak validator from size + mtime — never reads the whole file to hash it.
      expect(response.getHeader('ETag')).toBe('W/"1024-1234567890"')
      expect(response.getHeader('Content-Type')).toBe('application/octet-stream; charset=utf-8')
      expect(response.getHeader('Content-Disposition')).toBe(contentDisposition(mockFile.getPath(), { type: 'attachment' }))
    })

    it('should build a weak ETag with mtime 0 when the file has no mtime', async () => {
      const event = { isFresh: () => false } as unknown as IncomingHttpEvent;
      (File.create as any).mockReturnValueOnce({ ...mockFile, getMTime: vi.fn().mockReturnValue(undefined) })

      const response = BinaryFileResponse.download({ file: '/file/path', contentDispositionType: 'attachment', content: '' })
      await response.prepare(event, { make: () => ({ get: vi.fn() }) } as any)

      expect(response.getHeader('ETag')).toBe('W/"1024-0"')
    })
  })

  describe('setDeleteFileAfterSent', () => {
    it('should set deleteFileAfterSent to true', () => {
      const options: BinaryFileResponseOptions = {
        file: '/file/path',
        content: ''
      }
      const response = BinaryFileResponse.download(options).setDeleteFileAfterSent(true)
      expect(response.deleteFileAfterSentStatus).toBe(true)
    })
  })

  describe('prepare', () => {
    it('should set status to HTTP_NOT_MODIFIED if event is fresh', async () => {
      const event = {
        isFresh: () => true
      } as unknown as IncomingHttpEvent
      const options: BinaryFileResponseOptions = {
        file: '/file/path',
        content: ''
      }
      const response = BinaryFileResponse.file(options)
      await response.prepare(event)
      expect(response.status).toBe(HTTP_NOT_MODIFIED)
    })
  })

  it('should throw an error if no File are provided', () => {
    // @ts-expect-error - Invalid file value for testing purposes
    expect(() => BinaryFileResponse.file({ file: undefined, content: '' })).toThrow(FilesystemError)
  })

  it('should throw an error when calling setContent with a valid value', () => {
    const response = BinaryFileResponse.file({ file: '/file/path', content: '' })
    expect(() => response.setContent('')).toThrow(FilesystemError)
  })
})
