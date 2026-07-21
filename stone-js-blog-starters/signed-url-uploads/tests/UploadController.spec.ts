import { UploadController } from '../app/UploadController'
import { UploadService } from '../app/UploadService'
import { FileSystem, supportsSignedUrls } from '@stone-js/filesystem'
import { BadRequestError, IncomingHttpEvent } from '@stone-js/http-core'

vi.mock(import('@stone-js/router'), async (importOriginal) => ({ ...(await importOriginal()), EventHandler: vi.fn(() => vi.fn()), Get: vi.fn(() => vi.fn()), Post: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/http-core'), async (importOriginal) => ({ ...(await importOriginal()), JsonHttpResponse: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/filesystem'), async (importOriginal) => ({ ...(await importOriginal()), supportsSignedUrls: vi.fn() }))

const eventWithId = (id?: string): IncomingHttpEvent =>
  ({ get: (_key: string, fallback?: string) => id ?? fallback }) as unknown as IncomingHttpEvent

describe('UploadController', () => {
  const signed = { url: 'https://bucket/put', method: 'PUT', headers: { 'content-type': 'image/png' }, expiresIn: 600 }
  let fileSystem: FileSystem
  let uploadService: UploadService
  let controller: UploadController

  beforeEach(() => {
    fileSystem = {
      temporaryUploadUrl: vi.fn(async () => signed),
      temporaryUrl: vi.fn(async () => 'https://bucket/get?sig=abc')
    } as unknown as FileSystem
    uploadService = { record: vi.fn((r) => r) } as unknown as UploadService
    controller = new UploadController({ fileSystem, uploadService })
    vi.mocked(supportsSignedUrls).mockReturnValue(true)
  })

  it('mints a direct-to-storage upload target', async () => {
    const result = await controller.sign(eventWithId('u1'))
    expect(fileSystem.temporaryUploadUrl).toHaveBeenCalledWith('avatars/u1.png', { contentType: 'image/png', expiresIn: 600 })
    expect(result).toBe(signed)
  })

  it('records only the metadata on completion', () => {
    const result = controller.complete(eventWithId('u1'))
    expect(uploadService.record).toHaveBeenCalledWith({ id: 'u1', key: 'avatars/u1.png', contentType: 'image/png' })
    expect(result).toEqual({ id: 'u1', key: 'avatars/u1.png', contentType: 'image/png' })
  })

  it('mints a short-lived download URL', async () => {
    const result = await controller.downloadUrl(eventWithId('u1'))
    expect(fileSystem.temporaryUrl).toHaveBeenCalledWith('avatars/u1.png', { expiresIn: 60 })
    expect(result).toEqual({ url: 'https://bucket/get?sig=abc' })
  })

  it('rejects when the disk cannot sign URLs', async () => {
    vi.mocked(supportsSignedUrls).mockReturnValue(false)
    await expect(controller.sign(eventWithId())).rejects.toBeInstanceOf(BadRequestError)
  })
})
