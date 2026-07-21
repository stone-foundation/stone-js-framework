import { Readable } from 'node:stream'
import { AzureBlobFileSystem } from '../../src/drivers/AzureBlobFileSystem'
import { CloudFileError } from '../../src/errors/CloudFileError'

const h = vi.hoisted(() => {
  const blob: any = {
    url: 'https://acct.blob.core.windows.net/c/key',
    exists: vi.fn(),
    downloadToBuffer: vi.fn(),
    uploadData: vi.fn(),
    deleteIfExists: vi.fn(),
    getProperties: vi.fn(),
    download: vi.fn()
  }
  const getBlockBlobClient = vi.fn(() => blob)
  const listBlobsFlat = vi.fn()
  const listBlobsByHierarchy = vi.fn()
  const container = { getBlockBlobClient, listBlobsFlat, listBlobsByHierarchy }
  const getContainerClient = vi.fn(() => container)
  const fromConnectionString = vi.fn(() => ({ getContainerClient }))
  const BlobServiceClient: any = vi.fn(() => ({ getContainerClient }))
  BlobServiceClient.fromConnectionString = fromConnectionString
  const StorageSharedKeyCredential = vi.fn()
  const generateBlobSASQueryParameters = vi.fn(() => ({ toString: () => 'sig=abc' }))
  const BlobSASPermissions = { parse: vi.fn((p: string) => p) }
  return { blob, getBlockBlobClient, listBlobsFlat, listBlobsByHierarchy, getContainerClient, fromConnectionString, BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions }
})

vi.mock('@azure/storage-blob', () => ({
  BlobServiceClient: h.BlobServiceClient,
  StorageSharedKeyCredential: h.StorageSharedKeyCredential,
  generateBlobSASQueryParameters: h.generateBlobSASQueryParameters,
  BlobSASPermissions: h.BlobSASPermissions
}))

const driver = (over: any = {}): AzureBlobFileSystem =>
  AzureBlobFileSystem.create({ container: 'c', connectionString: 'conn', ...over })

const signable = (over: any = {}): AzureBlobFileSystem =>
  AzureBlobFileSystem.create({ container: 'c', accountName: 'acct', accountKey: 'key', ...over })

async function * gen (items: any[]): AsyncGenerator<any> {
  for (const item of items) { yield item }
}

describe('AzureBlobFileSystem', () => {
  beforeEach(() => {
    for (const fn of Object.values(h.blob)) { if (typeof fn === 'function') { (fn as any).mockReset?.() } }
    h.getBlockBlobClient.mockClear()
    h.listBlobsFlat.mockReset()
    h.listBlobsByHierarchy.mockReset()
    h.fromConnectionString.mockClear()
    h.BlobServiceClient.mockClear()
    h.generateBlobSASQueryParameters.mockClear()
  })

  it('requires a container', () => {
    expect(() => AzureBlobFileSystem.create({} as any)).toThrow(CloudFileError)
  })

  it('exposes its disk name (default and custom)', () => {
    expect(driver().name).toBe('azure')
    expect(driver({ name: 'media' }).name).toBe('media')
  })

  it('exists reflects presence and wraps errors', async () => {
    h.blob.exists.mockResolvedValue(true)
    expect(await driver().exists('a')).toBe(true)
    h.blob.exists.mockResolvedValue(false)
    expect(await driver().exists('a')).toBe(false)
    h.blob.exists.mockRejectedValue(new Error('boom'))
    await expect(driver().exists('a')).rejects.toThrow(CloudFileError)
  })

  it('get downloads a buffer; getText decodes; wraps errors', async () => {
    h.blob.downloadToBuffer.mockResolvedValue(Buffer.from('hello'))
    expect((await driver().get('a')).toString()).toBe('hello')
    expect(await driver().getText('a')).toBe('hello')
    h.blob.downloadToBuffer.mockRejectedValue(new Error('boom'))
    await expect(driver().get('a')).rejects.toThrow(CloudFileError)
  })

  it('put uploads string/Buffer with a content type, applying the prefix, and wraps errors', async () => {
    h.blob.uploadData.mockResolvedValue(undefined)
    await driver({ root: 'p' }).put('a.png', 'x')
    expect(h.getBlockBlobClient).toHaveBeenCalledWith('p/a.png')
    expect(Buffer.isBuffer(h.blob.uploadData.mock.calls[0][0])).toBe(true)
    expect(h.blob.uploadData.mock.calls[0][1]).toEqual({ blobHTTPHeaders: { blobContentType: 'image/png' } })

    h.blob.uploadData.mockRejectedValue(new Error('boom'))
    await expect(driver().put('a', 'x')).rejects.toThrow(CloudFileError)
  })

  it('delete reflects deleteIfExists and wraps errors', async () => {
    h.blob.deleteIfExists.mockResolvedValue({ succeeded: true })
    expect(await driver().delete('a')).toBe(true)
    h.blob.deleteIfExists.mockResolvedValue({ succeeded: false })
    expect(await driver().delete('a')).toBe(false)
    h.blob.deleteIfExists.mockRejectedValue(new Error('boom'))
    await expect(driver().delete('a')).rejects.toThrow(CloudFileError)
  })

  it('copy is download+upload; move copies then deletes', async () => {
    h.blob.downloadToBuffer.mockResolvedValue(Buffer.from('data'))
    h.blob.uploadData.mockResolvedValue(undefined)
    await driver().copy('a', 'b')
    expect(h.blob.uploadData).toHaveBeenCalled()

    h.blob.deleteIfExists.mockResolvedValue({ succeeded: true })
    await driver().move('a', 'b')
    expect(h.blob.deleteIfExists).toHaveBeenCalled()
  })

  it('stat maps properties (with/without contentType, non-Date lastModified) and wraps errors', async () => {
    const when = new Date('2026-07-20T00:00:00Z')
    h.blob.getProperties.mockResolvedValue({ contentLength: 12, lastModified: when, contentType: 'text/plain' })
    expect(await driver().stat('a.txt')).toEqual({ path: 'a.txt', size: 12, lastModified: when.getTime(), mimeType: 'text/plain', isFile: true, isDirectory: false })

    h.blob.getProperties.mockResolvedValue({})
    expect(await driver().stat('a.png')).toMatchObject({ size: 0, lastModified: undefined, mimeType: 'image/png' })
    h.blob.getProperties.mockResolvedValue({})
    expect((await driver().stat('README')).mimeType).toBeUndefined()

    h.blob.getProperties.mockRejectedValue(new Error('boom'))
    await expect(driver().stat('a')).rejects.toThrow(CloudFileError)
  })

  it('size/lastModified/mimeType derive from stat', async () => {
    h.blob.getProperties.mockResolvedValue({ contentLength: 7, lastModified: new Date(0), contentType: 'text/plain' })
    expect(await driver().size('a')).toBe(7)
    expect(await driver().lastModified('a')).toBe(0)
    expect(await driver().mimeType('a')).toBe('text/plain')
  })

  it('url uses baseUrl or the blob url', async () => {
    expect(await driver({ baseUrl: 'https://cdn.test/' }).url('a.png')).toBe('https://cdn.test/a.png')
    expect(await driver().url('a.png')).toBe('https://acct.blob.core.windows.net/c/key')
  })

  it('files lists flat (recursive) and by hierarchy (non-recursive), stripping the prefix', async () => {
    h.listBlobsFlat.mockReturnValue(gen([{ name: 'p/a.txt' }, { name: 'p/sub/b.txt' }]))
    expect(await driver({ root: 'p' }).files()).toEqual(['a.txt', 'sub/b.txt'])
    expect(h.listBlobsFlat).toHaveBeenCalledWith({ prefix: 'p/' })

    h.listBlobsByHierarchy.mockReturnValue(gen([{ kind: 'blob', name: 'x.txt' }, { kind: 'prefix', name: 'sub/' }]))
    expect(await driver().files('', false)).toEqual(['x.txt'])
    expect(h.listBlobsByHierarchy).toHaveBeenCalledWith('/', { prefix: '' })
  })

  it('files wraps errors', async () => {
    h.listBlobsFlat.mockImplementation(() => { throw new Error('boom') })
    await expect(driver().files()).rejects.toThrow(CloudFileError)
  })

  it('makeDirectory is a no-op', async () => {
    await expect(driver().makeDirectory('x')).resolves.toBeUndefined()
  })

  it('readStream returns the download stream and wraps errors', async () => {
    const stream = Readable.from(['x'])
    h.blob.download.mockResolvedValue({ readableStreamBody: stream })
    expect(await driver().readStream('a')).toBe(stream)
    h.blob.download.mockRejectedValue(new Error('boom'))
    await expect(driver().readStream('a')).rejects.toThrow(CloudFileError)
  })

  it('writeStream buffers then uploads', async () => {
    h.blob.uploadData.mockResolvedValue(undefined)
    await driver().writeStream('a.txt', Readable.from(['ab', Buffer.from('c')]))
    expect(h.blob.uploadData.mock.calls[0][0].toString()).toBe('abc')
  })

  it('temporaryUrl signs a read SAS URL', async () => {
    const url = await signable().temporaryUrl('a.txt', { expiresIn: 60, responseContentType: 'text/plain', responseContentDisposition: 'inline' })
    expect(url).toBe('https://acct.blob.core.windows.net/c/key?sig=abc')
    expect(h.BlobSASPermissions.parse).toHaveBeenCalledWith('r')
    expect(h.generateBlobSASQueryParameters.mock.calls[0][0]).toMatchObject({ contentType: 'text/plain', contentDisposition: 'inline' })
  })

  it('temporaryUploadUrl signs a create+write SAS URL with the blob-type header', async () => {
    const up = await signable({ signedUrlExpiresIn: 120 }).temporaryUploadUrl('a.png', { contentType: 'image/png' })
    expect(up).toEqual({
      url: 'https://acct.blob.core.windows.net/c/key?sig=abc',
      method: 'PUT',
      headers: { 'x-ms-blob-type': 'BlockBlob', 'content-type': 'image/png' },
      expiresIn: 120
    })
    expect(h.BlobSASPermissions.parse).toHaveBeenCalledWith('cw')
  })

  it('temporaryUploadUrl without a content type still sets the blob-type header (default expiry)', async () => {
    const up = await signable().temporaryUploadUrl('a.bin')
    expect(up.headers).toEqual({ 'x-ms-blob-type': 'BlockBlob' })
    expect(up.expiresIn).toBe(900)
  })

  it('temporaryUrl falls back to the default expiry when none is given', async () => {
    const url = await signable().temporaryUrl('a.txt')
    expect(url).toBe('https://acct.blob.core.windows.net/c/key?sig=abc')
  })

  it('signed URLs require accountName + accountKey', async () => {
    await expect(driver().temporaryUrl('a')).rejects.toThrow(/accountName/)
  })

  it('builds the container from account credentials when no connection string is given', async () => {
    h.blob.exists.mockResolvedValue(true)
    await signable().exists('a')
    expect(h.BlobServiceClient).toHaveBeenCalledWith('https://acct.blob.core.windows.net', expect.anything())
  })

  it('throws when neither a connection string nor account credentials are configured', async () => {
    h.blob.exists.mockResolvedValue(true)
    await expect(AzureBlobFileSystem.create({ container: 'c' }).exists('a')).rejects.toThrow(/connectionString/)
  })

  it('wrap tolerates a non-Error rejection', async () => {
    h.blob.downloadToBuffer.mockRejectedValue('plain failure')
    await expect(driver().get('a')).rejects.toThrow(/plain failure/)
  })
})
