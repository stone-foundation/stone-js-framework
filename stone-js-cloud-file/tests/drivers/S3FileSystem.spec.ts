import { Readable } from 'node:stream'
import { S3FileSystem } from '../../src/drivers/S3FileSystem'
import { CloudFileError } from '../../src/errors/CloudFileError'

const { send, getSignedUrl, S3Client } = vi.hoisted(() => ({
  send: vi.fn(),
  getSignedUrl: vi.fn(),
  S3Client: vi.fn()
}))

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: S3Client.mockImplementation(() => ({ send })),
  HeadObjectCommand: class { constructor (public readonly input: any) {} },
  GetObjectCommand: class { constructor (public readonly input: any) {} },
  PutObjectCommand: class { constructor (public readonly input: any) {} },
  DeleteObjectCommand: class { constructor (public readonly input: any) {} },
  CopyObjectCommand: class { constructor (public readonly input: any) {} },
  ListObjectsV2Command: class { constructor (public readonly input: any) {} }
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl }))

const driver = (over: any = {}): S3FileSystem => S3FileSystem.create({ bucket: 'my-bucket', region: 'eu-west-3', ...over })

const notFound = (): any => Object.assign(new Error('nope'), { $metadata: { httpStatusCode: 404 } })

describe('S3FileSystem', () => {
  beforeEach(() => {
    send.mockReset()
    getSignedUrl.mockReset()
    S3Client.mockClear()
  })

  it('requires a bucket', () => {
    expect(() => S3FileSystem.create({} as any)).toThrow(CloudFileError)
  })

  it('exposes its disk name (default and custom)', () => {
    expect(driver().name).toBe('s3')
    expect(driver({ name: 'media' }).name).toBe('media')
  })

  it('put sends a PutObjectCommand with a guessed content type', async () => {
    send.mockResolvedValue({})
    await driver().put('avatars/1.png', Buffer.from('x'))
    expect(send.mock.calls[0][0].input).toMatchObject({ Bucket: 'my-bucket', Key: 'avatars/1.png', ContentType: 'image/png' })
  })

  it('put wraps SDK errors', async () => {
    send.mockRejectedValue(new Error('boom'))
    await expect(driver().put('a.txt', 'x')).rejects.toThrow(CloudFileError)
  })

  it('get reads the object bytes', async () => {
    send.mockResolvedValue({ Body: { transformToByteArray: async () => new Uint8Array([1, 2, 3]) } })
    const buf = await driver().get('a.bin')
    expect([...buf]).toEqual([1, 2, 3])
  })

  it('getText decodes bytes as text (default and explicit encoding)', async () => {
    send.mockResolvedValue({ Body: { transformToByteArray: async () => new Uint8Array(Buffer.from('hello')) } })
    expect(await driver().getText('a.txt')).toBe('hello')
    expect(await driver().getText('a.txt', 'utf-8')).toBe('hello')
  })

  it('get wraps SDK errors', async () => {
    send.mockRejectedValue(new Error('boom'))
    await expect(driver().get('a.bin')).rejects.toThrow(CloudFileError)
  })

  it('exists returns true when HEAD succeeds', async () => {
    send.mockResolvedValue({})
    expect(await driver().exists('a.txt')).toBe(true)
  })

  it('exists returns false on 404 / NotFound / NoSuchKey', async () => {
    send.mockRejectedValueOnce(notFound())
    expect(await driver().exists('a.txt')).toBe(false)
    send.mockRejectedValueOnce(Object.assign(new Error(), { name: 'NotFound' }))
    expect(await driver().exists('a.txt')).toBe(false)
    send.mockRejectedValueOnce(Object.assign(new Error(), { Code: 'NoSuchKey' }))
    expect(await driver().exists('a.txt')).toBe(false)
  })

  it('exists wraps unexpected errors', async () => {
    send.mockRejectedValue(Object.assign(new Error('boom'), { $metadata: { httpStatusCode: 500 } }))
    await expect(driver().exists('a.txt')).rejects.toThrow(CloudFileError)
  })

  it('delete returns false when the object does not exist', async () => {
    send.mockRejectedValueOnce(notFound()) // exists() → false
    expect(await driver().delete('a.txt')).toBe(false)
  })

  it('delete removes an existing object and returns true', async () => {
    send.mockResolvedValueOnce({}) // exists()
    send.mockResolvedValueOnce({}) // delete
    expect(await driver().delete('a.txt')).toBe(true)
  })

  it('delete wraps SDK errors', async () => {
    send.mockResolvedValueOnce({}) // exists()
    send.mockRejectedValueOnce(new Error('boom')) // delete
    await expect(driver().delete('a.txt')).rejects.toThrow(CloudFileError)
  })

  it('copy sends a CopyObjectCommand', async () => {
    send.mockResolvedValue({})
    await driver().copy('a.txt', 'b.txt')
    expect(send.mock.calls[0][0].input).toMatchObject({ Bucket: 'my-bucket', Key: 'b.txt', CopySource: 'my-bucket/a.txt' })
  })

  it('copy wraps SDK errors', async () => {
    send.mockRejectedValue(new Error('boom'))
    await expect(driver().copy('a', 'b')).rejects.toThrow(CloudFileError)
  })

  it('move copies then deletes', async () => {
    send.mockResolvedValueOnce({}) // copy
    send.mockResolvedValueOnce({}) // exists (delete)
    send.mockResolvedValueOnce({}) // delete
    await driver().move('a.txt', 'b.txt')
    expect(send.mock.calls[0][0].input.CopySource).toBe('my-bucket/a.txt')
  })

  it('stat returns metadata (with and without ContentType/LastModified)', async () => {
    const when = new Date('2026-07-20T00:00:00Z')
    send.mockResolvedValueOnce({ ContentLength: 12, LastModified: when, ContentType: 'text/plain' })
    expect(await driver().stat('a.txt')).toEqual({
      path: 'a.txt', size: 12, lastModified: when.getTime(), mimeType: 'text/plain', isFile: true, isDirectory: false
    })

    send.mockResolvedValueOnce({}) // no ContentLength/LastModified/ContentType → defaults + mime fallback
    const stat = await driver().stat('a.png')
    expect(stat).toMatchObject({ size: 0, lastModified: undefined, mimeType: 'image/png' })

    send.mockResolvedValueOnce({}) // extension-less, no ContentType → mimeType undefined
    expect((await driver().stat('README')).mimeType).toBeUndefined()
  })

  it('stat wraps SDK errors', async () => {
    send.mockRejectedValue(new Error('boom'))
    await expect(driver().stat('a.txt')).rejects.toThrow(CloudFileError)
  })

  it('size / lastModified / mimeType derive from stat', async () => {
    send.mockResolvedValue({ ContentLength: 7, LastModified: new Date(0), ContentType: 'text/plain' })
    expect(await driver().size('a')).toBe(7)
    expect(await driver().lastModified('a')).toBe(0)
    expect(await driver().mimeType('a')).toBe('text/plain')
  })

  it('url builds from baseUrl, endpoint (path-style and virtual-host), and the default AWS host', async () => {
    expect(await driver({ baseUrl: 'https://cdn.test/' }).url('a.png')).toBe('https://cdn.test/a.png')
    expect(await driver({ endpoint: 'https://minio.test', forcePathStyle: true }).url('a.png')).toBe('https://minio.test/my-bucket/a.png')
    expect(await driver({ endpoint: 'https://r2.test' }).url('a.png')).toBe('https://r2.test/a.png')
    expect(await driver({ region: undefined }).url('a.png')).toBe('https://my-bucket.s3.us-east-1.amazonaws.com/a.png')
    expect(await driver().url('a.png')).toBe('https://my-bucket.s3.eu-west-3.amazonaws.com/a.png')
  })

  it('files lists keys across pages and strips the root prefix', async () => {
    send.mockResolvedValueOnce({ Contents: [{ Key: 'p/a.txt' }], IsTruncated: true, NextContinuationToken: 't' })
    send.mockResolvedValueOnce({ Contents: [{ Key: 'p/b.txt' }, {}], IsTruncated: false })
    const files = await driver({ root: '/p/' }).files()
    expect(files).toEqual(['a.txt', 'b.txt'])
    expect(send.mock.calls[0][0].input).toMatchObject({ Prefix: 'p/', Delimiter: undefined })
  })

  it('files honours a sub-directory and non-recursive listing (Delimiter)', async () => {
    send.mockResolvedValueOnce({ Contents: [{ Key: 'sub/x.txt' }], IsTruncated: false })
    await driver().files('sub', false)
    expect(send.mock.calls[0][0].input).toMatchObject({ Prefix: 'sub/', Delimiter: '/' })
  })

  it('files tolerates a page with no Contents', async () => {
    send.mockResolvedValueOnce({ IsTruncated: false })
    expect(await driver().files()).toEqual([])
    expect(send.mock.calls[0][0].input.Prefix).toBe('')
  })

  it('files wraps SDK errors', async () => {
    send.mockRejectedValue(new Error('boom'))
    await expect(driver().files()).rejects.toThrow(CloudFileError)
  })

  it('makeDirectory is a no-op', async () => {
    await expect(driver().makeDirectory('any')).resolves.toBeUndefined()
    expect(send).not.toHaveBeenCalled()
  })

  it('readStream returns the object body stream', async () => {
    const body = Readable.from(['chunk'])
    send.mockResolvedValue({ Body: body })
    expect(await driver().readStream('a.txt')).toBe(body)
  })

  it('readStream wraps SDK errors', async () => {
    send.mockRejectedValue(new Error('boom'))
    await expect(driver().readStream('a.txt')).rejects.toThrow(CloudFileError)
  })

  it('writeStream buffers the stream (string and Buffer chunks) then puts', async () => {
    send.mockResolvedValue({})
    await driver().writeStream('a.txt', Readable.from(['ab', Buffer.from('c')]))
    expect(send.mock.calls[0][0].input.Body.toString()).toBe('abc')
  })

  it('temporaryUrl signs a GET, passing response overrides', async () => {
    getSignedUrl.mockResolvedValue('https://signed-get')
    const url = await driver().temporaryUrl('a.txt', { expiresIn: 60, responseContentType: 'text/plain', responseContentDisposition: 'inline' })
    expect(url).toBe('https://signed-get')
    const command = getSignedUrl.mock.calls[0][1]
    expect(command.input).toMatchObject({ Key: 'a.txt', ResponseContentType: 'text/plain', ResponseContentDisposition: 'inline' })
    expect(getSignedUrl.mock.calls[0][2]).toEqual({ expiresIn: 60 })
  })

  it('temporaryUploadUrl signs a PUT and returns required headers', async () => {
    getSignedUrl.mockResolvedValue('https://signed-put')
    const up = await driver({ signedUrlExpiresIn: 120 }).temporaryUploadUrl('a.png', { contentType: 'image/png' })
    expect(up).toEqual({ url: 'https://signed-put', method: 'PUT', headers: { 'content-type': 'image/png' }, expiresIn: 120 })
  })

  it('temporaryUploadUrl omits the content-type header when none is given', async () => {
    getSignedUrl.mockResolvedValue('https://signed-put')
    const up = await driver().temporaryUploadUrl('a.bin')
    expect(up.headers).toEqual({})
    expect(up.expiresIn).toBe(900)
  })

  it('temporaryUrl uses the default expiry when none is given', async () => {
    getSignedUrl.mockResolvedValue('https://signed-get')
    await driver().temporaryUrl('a.txt')
    expect(getSignedUrl.mock.calls[0][2]).toEqual({ expiresIn: 900 })
  })

  it('wrap tolerates a non-Error rejection (no message)', async () => {
    send.mockRejectedValue('plain failure')
    await expect(driver().get('a.bin')).rejects.toThrow(/plain failure/)
  })

  it('rejects an empty-string bucket', () => {
    expect(() => S3FileSystem.create({ bucket: '' } as any)).toThrow(CloudFileError)
  })

  it('wrap returns an existing CloudFileError untouched', async () => {
    const original = new CloudFileError('already wrapped')
    send.mockRejectedValue(original)
    await expect(driver().stat('a.txt')).rejects.toBe(original)
  })

  it('builds the S3 client once and reuses it', async () => {
    send.mockResolvedValue({})
    const d = driver()
    await d.put('a', 'x')
    await d.put('b', 'y')
    expect(S3Client).toHaveBeenCalledTimes(1)
  })
})
