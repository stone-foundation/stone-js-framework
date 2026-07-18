import { Readable } from 'node:stream'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mkdtempSync, rmSync } from 'node:fs'
import { LocalFileSystem } from '../../src/storage/LocalFileSystem'
import { StorageManager } from '../../src/storage/StorageManager'
import { FilesystemError } from '../../src/errors/FilesystemError'

describe('LocalFileSystem (real filesystem)', () => {
  let root: string
  let disk: LocalFileSystem

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'stone-fs-'))
    disk = LocalFileSystem.create({ root, name: 'test' })
  })

  afterEach(() => { rmSync(root, { recursive: true, force: true }) })

  it('put/get round-trips content and creates parent directories', async () => {
    await disk.put('nested/dir/file.txt', 'hello')
    expect(await disk.exists('nested/dir/file.txt')).toBe(true)
    expect(await disk.getText('nested/dir/file.txt')).toBe('hello')
    expect((await disk.get('nested/dir/file.txt')).equals(Buffer.from('hello'))).toBe(true)
  })

  it('is binary-safe', async () => {
    const bytes = Buffer.from([0xff, 0x00, 0x10, 0x80])
    await disk.put('bin.dat', bytes)
    expect((await disk.get('bin.dat')).equals(bytes)).toBe(true)
  })

  it('delete removes a file and reports whether anything was deleted', async () => {
    await disk.put('a.txt', 'x')
    expect(await disk.delete('a.txt')).toBe(true)
    expect(await disk.exists('a.txt')).toBe(false)
    expect(await disk.delete('a.txt')).toBe(false)
  })

  it('copy and move within the disk', async () => {
    await disk.put('src.txt', 'data')
    await disk.copy('src.txt', 'copy.txt')
    expect(await disk.getText('copy.txt')).toBe('data')
    expect(await disk.exists('src.txt')).toBe(true)

    await disk.move('copy.txt', 'moved/final.txt')
    expect(await disk.getText('moved/final.txt')).toBe('data')
    expect(await disk.exists('copy.txt')).toBe(false)
  })

  it('exposes stat/size/lastModified/mimeType', async () => {
    await disk.put('image.png', Buffer.from([1, 2, 3]))
    const stat = await disk.stat('image.png')
    expect(stat.size).toBe(3)
    expect(stat.isFile).toBe(true)
    expect(stat.isDirectory).toBe(false)
    expect(stat.mimeType).toBe('image/png')
    expect(await disk.size('image.png')).toBe(3)
    expect(typeof await disk.lastModified('image.png')).toBe('number')
    expect(await disk.mimeType('doc.pdf')).toBe('application/pdf')
  })

  it('lists files recursively', async () => {
    await disk.put('a.txt', '1')
    await disk.put('sub/b.txt', '2')
    const flat = await disk.files()
    expect(flat).toContain('a.txt')
    const all = await disk.files('', true)
    expect(all.sort()).toEqual(['a.txt', join('sub', 'b.txt')].sort())
  })

  it('makes a directory', async () => {
    await disk.makeDirectory('new/dir')
    expect((await disk.stat('new/dir')).isDirectory).toBe(true)
  })

  it('streams content in and out', async () => {
    await disk.writeStream('stream.txt', Readable.from(['chunk1', 'chunk2']))
    const chunks: Buffer[] = []
    for await (const chunk of await disk.readStream('stream.txt')) { chunks.push(Buffer.from(chunk)) }
    expect(Buffer.concat(chunks).toString()).toBe('chunk1chunk2')
  })

  it('builds a file:// url by default and a base url when configured', async () => {
    await disk.put('x.txt', '1')
    expect(await disk.url('x.txt')).toMatch(/^file:\/\//)
    const cdn = LocalFileSystem.create({ root, baseUrl: 'https://cdn.test/assets/' })
    expect(await cdn.url('x.txt')).toBe('https://cdn.test/assets/x.txt')
  })

  it('CONFINES access to the root (rejects traversal)', async () => {
    await expect(disk.get('../../../etc/passwd')).rejects.toThrow(FilesystemError)
    await expect(disk.put('../escape.txt', 'x')).rejects.toThrow(FilesystemError)
  })

  it('returns undefined mimeType for an unknown extension', async () => {
    expect(await disk.mimeType('file.unknownext')).toBeUndefined()
  })

  it('accepts an absolute path inside the root', async () => {
    await disk.put('abs.txt', 'v')
    expect(await disk.getText(join(root, 'abs.txt'))).toBe('v')
  })

  it('rejects reading a missing stream', async () => {
    await expect(disk.readStream('nope.txt')).rejects.toThrow(FilesystemError)
  })

  it('rejects stat, copy and move on a missing source', async () => {
    await expect(disk.stat('missing.txt')).rejects.toThrow(FilesystemError)
    await expect(disk.copy('missing.txt', 'dest.txt')).rejects.toThrow(FilesystemError)
    await expect(disk.move('missing.txt', 'dest.txt')).rejects.toThrow(FilesystemError)
  })
})

describe('StorageManager', () => {
  it('registers a local disk by default', () => {
    const storage = StorageManager.create()
    expect(storage.has('local')).toBe(true)
    expect(storage.disk('local')).toBeInstanceOf(LocalFileSystem)
    expect(storage.disk().name).toBe('local') // default
  })

  it('registers and resolves a custom driver (S3-style) by name', () => {
    const storage = StorageManager.create()
    const fake: any = { name: 's3' }
    let built = 0
    storage.registerFactory('s3', () => { built++; return fake })

    expect(storage.has('s3')).toBe(true)
    expect(built).toBe(0) // lazy
    expect(storage.disk('s3')).toBe(fake)
    expect(storage.disk('s3')).toBe(fake) // cached
    expect(built).toBe(1)
  })

  it('supports a ready-made instance and a changed default', () => {
    const storage = StorageManager.create()
    const fake: any = { name: 'mem' }
    storage.register('mem', fake).setDefaultDisk('mem')
    expect(storage.disk()).toBe(fake)
  })

  it('throws for an unknown disk', () => {
    expect(() => StorageManager.create().disk('nope')).toThrow(FilesystemError)
  })
})
