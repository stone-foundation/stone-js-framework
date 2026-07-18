import { Mock } from 'vitest'
import { File } from '@stone-js/filesystem'
import { IBlueprint, ILogger } from '@stone-js/core'
import { IncomingHttpEvent } from '../../src/IncomingHttpEvent'
import { BinaryFileResponse } from '../../src/BinaryFileResponse'
import { StaticFileMiddleware } from '../../src/middleware/StaticFileMiddleware'

vi.mock('@stone-js/filesystem') // Mock the File class
vi.mock('../../src/IncomingHttpEvent') // Mock the IncomingHttpEvent class
vi.mock('../../src/BinaryFileResponse') // Mock the BinaryFileResponse class

describe('StaticFileMiddleware', () => {
  let blueprintMock: any
  let loggerMock: ILogger
  let responseMock: any
  let middleware: StaticFileMiddleware

  beforeEach(() => {
    // Mock dependencies
    blueprintMock = {
      get: vi.fn()
    } as unknown as IBlueprint

    responseMock = { content: 'nextResponse', isNotFound: vi.fn(() => false) }

    loggerMock = {
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn()
    } as unknown as ILogger

    // Mock configuration
    blueprintMock.get.mockImplementation((key: string, defaultValue: string) => {
      const config: Record<string, any> = {
        'stone.http.files.rootDir': '/root',
        'stone.http.files.defaultCompressionEncoding': {
          '.br': 'br',
          '.brotli': 'br',
          '.gzip': 'gzip',
          '.gz': 'gz'
        }
      }
      return config[key] ?? defaultValue
    })

    // Instantiate the middleware
    BinaryFileResponse.file = vi.fn(({ file }) => file ?? 'binaryFileResponse') as any
    middleware = new StaticFileMiddleware({ blueprint: blueprintMock, logger: loggerMock })
  })

  it('should serve a static file if it exists', async () => {
    const fileMock = {
      exists: vi.fn().mockReturnValue(true),
      isDir: vi.fn().mockReturnValue(false),
      isPathPrefix: vi.fn().mockReturnValue(true),
      getPath: vi.fn().mockReturnValue('/root/file.txt')
    };
    (File.create as Mock).mockReturnValue(fileMock)

    const nextMock = vi.fn(() => responseMock)
    const eventMock = { pathname: '/file.txt', getHeader: vi.fn(() => '') } as any

    const response = await middleware.handle(eventMock, nextMock)

    expect(File.create).toHaveBeenCalledWith('/root/file.txt', false)
    expect(fileMock.exists).toHaveBeenCalled()
    expect(fileMock.isDir).toHaveBeenCalled()
    expect(BinaryFileResponse.file).toHaveBeenCalledWith({
      file: fileMock,
      autoEtag: true,
      autoLastModified: true,
      autoEncoding: true
    })
    expect(response).toBeDefined()
    expect(nextMock).not.toHaveBeenCalled()
  })

  it('should pass the request to the next middleware if the file does not exist', async () => {
    const fileMock = {
      exists: vi.fn().mockReturnValue(false),
      isPathPrefix: vi.fn().mockReturnValue(false),
      getPath: vi.fn().mockReturnValue('/root/file.txt')
    };
    (File.create as Mock).mockReturnValue(fileMock)

    responseMock.isNotFound.mockReturnValue(true)
    const nextMock = vi.fn().mockResolvedValue(responseMock)
    const eventMock = { pathname: '/nonexistent.txt', getHeader: vi.fn(() => 'gzip, br') } as any

    const response = await middleware.handle(eventMock, nextMock)

    expect(File.create).toHaveBeenCalledWith('/root/nonexistent.txt', false)
    expect(fileMock.exists).toHaveBeenCalled()
    expect(nextMock).toHaveBeenCalled()
    expect(response.content).toBe('nextResponse')
    expect(loggerMock.info).toHaveBeenCalledWith('No static file found for path: /nonexistent.txt')
  })

  it('should pass the request to the next middleware if the requested path is a directory', async () => {
    const fileMock = {
      exists: vi.fn().mockReturnValue(true),
      isDir: vi.fn().mockReturnValue(true),
      getPath: vi.fn().mockReturnValue('/root/directory/'),
      isPathPrefix: vi.fn().mockReturnValue(false)
    };
    (File.create as Mock).mockReturnValue(fileMock)

    responseMock.isNotFound.mockReturnValue(true)
    const nextMock = vi.fn().mockResolvedValue(responseMock)
    const eventMock = { pathname: '/directory/', getHeader: vi.fn(() => 'gzip, br') } as any

    const response = await middleware.handle(eventMock, nextMock)

    expect(File.create).toHaveBeenCalledWith('/root/directory/', false)
    expect(fileMock.exists).toHaveBeenCalled()
    expect(nextMock).toHaveBeenCalled()
    expect(response.content).toBe('nextResponse')
    expect(loggerMock.info).toHaveBeenCalledWith('No static file found for path: /directory/')
  })

  it('should prioritize compressed files if supported by the client', async () => {
    const compressedFileMock = {
      isDir: vi.fn().mockReturnValue(false),
      exists: vi.fn().mockReturnValue(true),
      isPathPrefix: vi.fn().mockReturnValue(true),
      getPath: vi.fn().mockReturnValue('/root/filexx.txt.gz')
    };
    (File.create as Mock).mockImplementation((path: string) =>
      path.endsWith('.gz') ? compressedFileMock : { exists: vi.fn().mockReturnValue(false), isPathPrefix: vi.fn().mockReturnValue(true) }
    )

    const nextMock = vi.fn().mockResolvedValue(responseMock)
    const eventMock = {
      pathname: '/filexx.txt',
      getHeader: vi.fn(() => 'gz')
    } as unknown as IncomingHttpEvent

    const response = await middleware.handle(eventMock, nextMock)

    expect(File.create).toHaveBeenCalledWith('/root/filexx.txt.gz', false)
    expect(compressedFileMock.exists).toHaveBeenCalled()
    expect(BinaryFileResponse.file).toHaveBeenCalledWith({
      file: compressedFileMock,
      autoEtag: true,
      autoLastModified: true,
      autoEncoding: true
    })
    expect(response).toBeDefined()
    expect(nextMock).not.toHaveBeenCalled()
  })

  it('should handle errors gracefully and pass to next middleware', async () => {
    const fileMock = {
      exists: vi.fn().mockImplementation(() => {
        throw new Error('File system error')
      }),
      isPathPrefix: vi.fn().mockReturnValue(true),
      getPath: vi.fn().mockReturnValue('/root/file.txt')
    };
    (File.create as Mock).mockReturnValue(fileMock)

    const nextMock = vi.fn().mockResolvedValue(responseMock)
    const eventMock = { pathname: '/error.txt', getHeader: vi.fn(() => 'gzip, br') } as any

    const response = await middleware.handle(eventMock, nextMock)

    expect(loggerMock.error).toHaveBeenCalledWith(
      expect.stringContaining('File system error'),
      expect.anything()
    )
    expect(nextMock).toHaveBeenCalled()
    expect(response.content).toBe('nextResponse')
  })
})
