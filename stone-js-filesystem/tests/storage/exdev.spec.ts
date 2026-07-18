import { Readable } from 'node:stream'

// Mock fs/promises to simulate a cross-device (EXDEV) rename, which cannot be reproduced on a
// single real filesystem.
const rename = vi.fn()
const copyFile = vi.fn()
const rm = vi.fn()
const writeFile = vi.fn()

vi.mock('node:fs/promises', () => ({
  rename: (...a: any[]) => rename(...a),
  copyFile: (...a: any[]) => copyFile(...a),
  rm: (...a: any[]) => rm(...a),
  mkdir: vi.fn(async () => {}),
  stat: vi.fn(async () => ({ size: 0, mtimeMs: 0, isFile: () => true, isDirectory: () => false })),
  readFile: vi.fn(),
  writeFile: (...a: any[]) => writeFile(...a),
  readdir: vi.fn()
}))

const { LocalFileSystem } = await import('../../src/storage/LocalFileSystem')

describe('LocalFileSystem move (EXDEV fallback)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('falls back to copy + delete when rename fails with EXDEV', async () => {
    rename.mockRejectedValueOnce(Object.assign(new Error('cross-device'), { code: 'EXDEV' }))
    copyFile.mockResolvedValueOnce(undefined)
    rm.mockResolvedValueOnce(undefined)

    const disk = LocalFileSystem.create({ root: '/root' })
    await disk.move('a.txt', 'b.txt')

    expect(copyFile).toHaveBeenCalled()
    expect(rm).toHaveBeenCalled()
  })

  it('rethrows a non-EXDEV rename failure as a FilesystemError', async () => {
    rename.mockRejectedValueOnce(Object.assign(new Error('EPERM'), { code: 'EPERM' }))
    const disk = LocalFileSystem.create({ root: '/root' })
    await expect(disk.move('a.txt', 'b.txt')).rejects.toThrow(/Could not move/)
  })

  it('wraps a write failure in a FilesystemError', async () => {
    rename.mockResolvedValue(undefined)
    writeFile.mockRejectedValueOnce(Object.assign(new Error('ENOSPC'), { code: 'ENOSPC' }))
    const disk = LocalFileSystem.create({ root: '/root' })
    await expect(disk.put('a.txt', 'x')).rejects.toThrow(/Could not write/)
  })

  it('exports a Readable-friendly contract', () => {
    // Type-level smoke: Readable is importable alongside the driver.
    expect(typeof Readable).toBe('function')
  })
})
