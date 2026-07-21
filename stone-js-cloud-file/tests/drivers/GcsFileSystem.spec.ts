import { Readable } from 'node:stream'
import { GcsFileSystem } from '../../src/drivers/GcsFileSystem'
import { CloudFileError } from '../../src/errors/CloudFileError'

const h = vi.hoisted(() => {
  const fileMock: any = {
    exists: vi.fn(),
    download: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    getMetadata: vi.fn(),
    getSignedUrl: vi.fn(),
    createReadStream: vi.fn(),
    copy: vi.fn()
  }
  const fileFn = vi.fn(() => fileMock)
  const getFiles = vi.fn()
  const Storage = vi.fn(() => ({ bucket: () => ({ file: fileFn, getFiles }) }))
  return { fileMock, fileFn, getFiles, Storage }
})

vi.mock('@google-cloud/storage', () => ({ Storage: h.Storage }))

const driver = (over: any = {}): GcsFileSystem => GcsFileSystem.create({ bucket: 'my-bucket', ...over })

describe('GcsFileSystem', () => {
  beforeEach(() => {
    for (const fn of Object.values(h.fileMock)) { (fn as any).mockReset() }
    h.fileFn.mockClear()
    h.getFiles.mockReset()
    h.Storage.mockClear()
  })

  it('requires a bucket', () => {
    expect(() => GcsFileSystem.create({} as any)).toThrow(CloudFileError)
  })

  it('exposes its disk name (default and custom)', () => {
    expect(driver().name).toBe('gcs')
    expect(driver({ name: 'media' }).name).toBe('media')
  })

  it('exists reflects the object presence', async () => {
    h.fileMock.exists.mockResolvedValue([true])
    expect(await driver().exists('a.txt')).toBe(true)
    h.fileMock.exists.mockResolvedValue([false])
    expect(await driver().exists('a.txt')).toBe(false)
  })

  it('exists wraps errors', async () => {
    h.fileMock.exists.mockRejectedValue(new Error('boom'))
    await expect(driver().exists('a.txt')).rejects.toThrow(CloudFileError)
  })

  it('get downloads bytes; getText decodes', async () => {
    h.fileMock.download.mockResolvedValue([Buffer.from('hello')])
    expect((await driver().get('a.txt')).toString()).toBe('hello')
    h.fileMock.download.mockResolvedValue([Buffer.from('hi')])
    expect(await driver().getText('a.txt')).toBe('hi')
  })

  it('get wraps errors', async () => {
    h.fileMock.download.mockRejectedValue(new Error('boom'))
    await expect(driver().get('a.txt')).rejects.toThrow(CloudFileError)
  })

  it('put saves with a guessed content type, applying the root prefix to the key', async () => {
    h.fileMock.save.mockResolvedValue(undefined)
    await driver({ root: '/p/' }).put('a.png', Buffer.from('x'))
    expect(h.fileFn).toHaveBeenCalledWith('p/a.png')
    expect(h.fileMock.save).toHaveBeenCalledWith(expect.anything(), { contentType: 'image/png' })
  })

  it('put wraps errors', async () => {
    h.fileMock.save.mockRejectedValue(new Error('boom'))
    await expect(driver().put('a', 'x')).rejects.toThrow(CloudFileError)
  })

  it('delete returns false when absent, true when removed, wraps errors', async () => {
    h.fileMock.exists.mockResolvedValue([false])
    expect(await driver().delete('a')).toBe(false)

    h.fileMock.exists.mockResolvedValue([true])
    h.fileMock.delete.mockResolvedValue(undefined)
    expect(await driver().delete('a')).toBe(true)

    h.fileMock.exists.mockResolvedValue([true])
    h.fileMock.delete.mockRejectedValue(new Error('boom'))
    await expect(driver().delete('a')).rejects.toThrow(CloudFileError)
  })

  it('copy copies to the destination handle; move copies then deletes', async () => {
    h.fileMock.copy.mockResolvedValue(undefined)
    await driver().copy('a', 'b')
    expect(h.fileMock.copy).toHaveBeenCalled()

    h.fileMock.copy.mockResolvedValue(undefined)
    h.fileMock.exists.mockResolvedValue([true])
    h.fileMock.delete.mockResolvedValue(undefined)
    await driver().move('a', 'b')
    expect(h.fileMock.delete).toHaveBeenCalled()
  })

  it('copy wraps errors', async () => {
    h.fileMock.copy.mockRejectedValue(new Error('boom'))
    await expect(driver().copy('a', 'b')).rejects.toThrow(CloudFileError)
  })

  it('stat maps metadata (with and without contentType/updated)', async () => {
    h.fileMock.getMetadata.mockResolvedValue([{ size: '12', updated: '2026-07-20T00:00:00Z', contentType: 'text/plain' }])
    expect(await driver().stat('a.txt')).toEqual({
      path: 'a.txt', size: 12, lastModified: new Date('2026-07-20T00:00:00Z').getTime(), mimeType: 'text/plain', isFile: true, isDirectory: false
    })
    h.fileMock.getMetadata.mockResolvedValue([{}])
    expect(await driver().stat('a.png')).toMatchObject({ size: 0, lastModified: undefined, mimeType: 'image/png' })
    h.fileMock.getMetadata.mockResolvedValue([{}])
    expect((await driver().stat('README')).mimeType).toBeUndefined()
  })

  it('stat wraps errors; size/lastModified/mimeType derive from it', async () => {
    h.fileMock.getMetadata.mockResolvedValue([{ size: '7', updated: '2026-01-01T00:00:00Z', contentType: 'text/plain' }])
    expect(await driver().size('a')).toBe(7)
    expect(await driver().lastModified('a')).toBe(new Date('2026-01-01T00:00:00Z').getTime())
    expect(await driver().mimeType('a')).toBe('text/plain')

    h.fileMock.getMetadata.mockRejectedValue(new Error('boom'))
    await expect(driver().stat('a')).rejects.toThrow(CloudFileError)
  })

  it('url uses baseUrl or the default GCS host', async () => {
    expect(await driver({ baseUrl: 'https://cdn.test/' }).url('a.png')).toBe('https://cdn.test/a.png')
    expect(await driver().url('a.png')).toBe('https://storage.googleapis.com/my-bucket/a.png')
  })

  it('files lists names, strips the prefix and drops the prefix marker', async () => {
    h.getFiles.mockResolvedValue([[{ name: 'p/a.txt' }, { name: 'p/' }, { name: 'p/sub/b.txt' }]])
    expect(await driver({ root: 'p' }).files()).toEqual(['a.txt', 'sub/b.txt'])
    expect(h.getFiles).toHaveBeenCalledWith({ prefix: 'p/', delimiter: undefined })
  })

  it('files honours a sub-directory and non-recursive listing', async () => {
    h.getFiles.mockResolvedValue([[]])
    await driver().files('sub', false)
    expect(h.getFiles).toHaveBeenCalledWith({ prefix: 'sub/', delimiter: '/' })
  })

  it('files (no dir, no root) lists the whole bucket and wraps errors', async () => {
    h.getFiles.mockResolvedValue([[{ name: 'a.txt' }]])
    expect(await driver().files()).toEqual(['a.txt'])
    expect(h.getFiles).toHaveBeenCalledWith({ prefix: '', delimiter: undefined })

    h.getFiles.mockRejectedValue(new Error('boom'))
    await expect(driver().files()).rejects.toThrow(CloudFileError)
  })

  it('makeDirectory is a no-op', async () => {
    await expect(driver().makeDirectory('x')).resolves.toBeUndefined()
  })

  it('readStream returns the file read stream', async () => {
    const stream = Readable.from(['x'])
    h.fileMock.createReadStream.mockReturnValue(stream)
    expect(await driver().readStream('a.txt')).toBe(stream)
  })

  it('writeStream buffers then saves', async () => {
    h.fileMock.save.mockResolvedValue(undefined)
    await driver().writeStream('a.txt', Readable.from(['ab', Buffer.from('c')]))
    expect(h.fileMock.save.mock.calls[0][0].toString()).toBe('abc')
  })

  it('temporaryUrl signs a v4 read URL (default and custom expiry)', async () => {
    h.fileMock.getSignedUrl.mockResolvedValue(['https://signed-get'])
    expect(await driver().temporaryUrl('a.txt')).toBe('https://signed-get')
    expect(h.fileMock.getSignedUrl.mock.calls[0][0]).toMatchObject({ version: 'v4', action: 'read' })

    await driver().temporaryUrl('a.txt', { expiresIn: 60, responseContentType: 'text/plain', responseContentDisposition: 'inline' })
    expect(h.fileMock.getSignedUrl.mock.calls[1][0]).toMatchObject({ responseType: 'text/plain', responseDisposition: 'inline' })
  })

  it('temporaryUrl wraps errors', async () => {
    h.fileMock.getSignedUrl.mockRejectedValue(new Error('boom'))
    await expect(driver().temporaryUrl('a')).rejects.toThrow(CloudFileError)
  })

  it('temporaryUploadUrl signs a v4 write URL with required headers', async () => {
    h.fileMock.getSignedUrl.mockResolvedValue(['https://signed-put'])
    const up = await driver({ signedUrlExpiresIn: 120 }).temporaryUploadUrl('a.png', { contentType: 'image/png' })
    expect(up).toEqual({ url: 'https://signed-put', method: 'PUT', headers: { 'content-type': 'image/png' }, expiresIn: 120 })
    expect(h.fileMock.getSignedUrl.mock.calls[0][0]).toMatchObject({ version: 'v4', action: 'write' })
  })

  it('temporaryUploadUrl omits the header and wraps errors', async () => {
    h.fileMock.getSignedUrl.mockResolvedValue(['https://signed-put'])
    const up = await driver().temporaryUploadUrl('a.bin')
    expect(up.headers).toEqual({})
    expect(up.expiresIn).toBe(900)

    h.fileMock.getSignedUrl.mockRejectedValue(new Error('boom'))
    await expect(driver().temporaryUploadUrl('a')).rejects.toThrow(CloudFileError)
  })

  it('wrap tolerates a non-Error rejection', async () => {
    h.fileMock.download.mockRejectedValue('plain failure')
    await expect(driver().get('a')).rejects.toThrow(/plain failure/)
  })

  it('builds the Storage client once and reuses it', async () => {
    h.fileMock.exists.mockResolvedValue([true])
    const d = driver()
    await d.exists('a')
    await d.exists('b')
    expect(h.Storage).toHaveBeenCalledTimes(1)
  })
})
