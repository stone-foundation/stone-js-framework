import mime from 'mime'
import { Mock } from 'vitest'
import { filesize } from 'filesize'
import { createHash } from 'node:crypto'
import { File } from '../../src/file/File'
import { FilesystemError } from '../../src/errors/FilesystemError'
import { resolve, join, basename, dirname, isAbsolute, extname } from 'node:path'
import { mkdirSync, statSync, lstatSync, writeFileSync, renameSync, rmSync, accessSync, existsSync, readFileSync, chmodSync, copyFileSync } from 'node:fs'

const mockHash = {
  update: vi.fn().mockReturnThis(),
  digest: vi.fn().mockReturnValue('hashed-content')
}

vi.mock('node:fs', () => ({
  statSync: vi.fn(() => ({
    size: 12345
  })),
  lstatSync: vi.fn(() => ({ isSymbolicLink: () => false })),
  chmodSync: vi.fn(),
  existsSync: vi.fn(),
  accessSync: vi.fn(() => {}),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(() => 'File content'),
  copyFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  renameSync: vi.fn(),
  rmSync: vi.fn(),
  realpathSync: vi.fn((v) => v),
  constants: {
    W_OK: 2,
    R_OK: 4,
    X_OK: 1
  }
}))
vi.mock('node:crypto', () => ({
  createHash: vi.fn(() => mockHash)
}))
vi.mock('mime')
vi.mock('node:path')
vi.mock('filesize', () => ({ filesize: vi.fn(() => '12.3 kB') }))

/**
 * Unit tests for the File class (Part 2).
 */
describe('File', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getHashedContent', () => {
    it('should return the hashed content of the file', () => {
      const file = File.create('/path/to/file.txt', false)
      const hashedContent = file.getHashedContent('sha256')

      expect(createHash).toHaveBeenCalledWith('sha256')
      // Hashes the raw bytes (binary-safe), no utf-8 decode.
      expect(mockHash.update).toHaveBeenCalledWith('File content')
      expect(mockHash.digest).toHaveBeenCalledWith('hex')
      expect(hashedContent).toBe('hashed-content')
    })

    it('should throw error when file cannot be read', () => {
      const file = File.create('/path/to/file.txt', false);
      (readFileSync as Mock).mockImplementationOnce(() => { throw new Error('EACCES') })
      expect(() => file.getContent()).toThrow(FilesystemError)
    })

    it('should throw error on invalid file', () => {
      (existsSync as Mock).mockReturnValue(false)
      expect(() => File.create('/path/to/file.txt')).toThrow(FilesystemError)
    })
  })

  describe('getSize', () => {
    it('should return the file size as a number', () => {
      const file = File.create('/path/to/file.txt', false)
      const size = file.getSize()
      expect(size).toBe(12345)
    })

    it('should return the file size as a formatted string', () => {
      const file = File.create('/path/to/file.txt', false)
      const formattedSize = file.getSize(true)
      expect(filesize).toHaveBeenCalledWith(12345)
      expect(formattedSize).toBe('12.3 kB')
    })
  })

  describe('getMimeType', () => {
    it('should return the MIME type of the file', () => {
      (mime.getType as Mock).mockReturnValue('text/plain')
      const file = File.create('/path/to/file.txt', false)
      const mimeType = file.getMimeType()
      expect(mime.getType).toHaveBeenCalledWith('/path/to/file.txt')
      expect(mimeType).toBe('text/plain')
    })

    it('should return the fallback MIME type if detection fails', () => {
      (mime.getType as Mock).mockReturnValue(undefined)
      const file = File.create('/path/to/file.txt', false)
      const mimeType = file.getMimeType('application/octet-stream')
      expect(mimeType).toBe('application/octet-stream')
    })
  })

  describe('getAbsolutePath', () => {
    it('should return the absolute path of the file', () => {
      (resolve as Mock).mockReturnValue('/absolute/path/to/file.txt')
      const file = File.create('/path/to/file.txt', false)
      const absolutePath = file.getAbsolutePath()
      expect(resolve).toHaveBeenCalledWith('', '/path/to/file.txt')
      expect(absolutePath).toBe('/absolute/path/to/file.txt')
    })
  })

  describe('write', () => {
    it('should write content to the file (creating it if needed)', () => {
      (writeFileSync as Mock).mockReturnValue(true)
      const file = File.create('/path/to/file.txt', false)
      file.write('lorem ipsum')
      expect(writeFileSync).toHaveBeenCalledWith('/path/to/file.txt', 'lorem ipsum')
    })

    it('should throw error when file cannot be wrote', () => {
      const file = File.create('/path/to/file.txt', false);
      (writeFileSync as Mock).mockImplementationOnce(() => { throw new Error('EACCES') })
      expect(() => file.write('')).toThrow(FilesystemError)
    })
  })

  describe('edit', () => {
    it('should edit the content of the file', () => {
      (writeFileSync as Mock).mockReturnValue(true);
      (readFileSync as Mock).mockReturnValue('lorem ipsum')
      const file = File.create('/path/to/file.txt', false)
      file.edit((content) => content.toUpperCase())
      expect(writeFileSync).toHaveBeenCalledWith('/path/to/file.txt', 'LOREM IPSUM')
    })
  })

  describe('remove', () => {
    it('should remove the file', () => {
      (rmSync as Mock).mockReturnValue(true)
      const file = File.create('/path/to/file.txt', false)
      file.remove()
      expect(rmSync).toHaveBeenCalledWith('/path/to/file.txt', { force: false })
    })

    it('should throw error when file cannot be removed', () => {
      (rmSync as Mock).mockImplementation(() => { throw new Error('Cannot move file') })
      const file = File.create('/path/to/file.txt', false)
      expect(() => file.remove()).toThrow(FilesystemError)
    })
  })

  describe('move', () => {
    it('should move file from source to destination when directory exists', () => {
      (renameSync as Mock).mockReturnValue(true);
      (chmodSync as Mock).mockReturnValue(true);
      (existsSync as Mock).mockReturnValue(true);
      (join as Mock).mockReturnValue('/absolute/path/to/file2.txt')

      const file = File.create('/path/to/file.txt', false)
      const file2 = file.move('/path/to/file2.txt')

      expect(join).toHaveBeenCalled()
      expect(chmodSync).toHaveBeenCalled()
      expect(renameSync).toHaveBeenCalled()
      expect(file2.getPath()).toBe(encodeURI('/absolute/path/to/file2.txt'))
    })

    it('should move file from source to destination when directory not exists', () => {
      (renameSync as Mock).mockReturnValue(true);
      (chmodSync as Mock).mockReturnValue(true);
      (existsSync as Mock).mockReturnValue(false);
      (mkdirSync as Mock).mockReturnValue(true);
      (join as Mock).mockReturnValue('/absolute/path/to/file2.txt')

      const file = File.create('/path/to/file.txt', false)
      const file2 = file.move('/path/to/file2.txt')

      expect(join).toHaveBeenCalled()
      expect(chmodSync).toHaveBeenCalled()
      expect(renameSync).toHaveBeenCalled()
      expect(file2.getPath()).toBe(encodeURI('/absolute/path/to/file2.txt'))
    })

    it('should throw error on invalid access while creating file', () => {
      (existsSync as Mock).mockReturnValue(true);
      (accessSync as Mock).mockImplementation(() => { throw new Error('No access') })

      const file = File.create('/path/to/file.txt', false)
      expect(() => file.move('/path/to/file2.txt')).toThrow(FilesystemError)
    })

    it('should throw error on creating directory', () => {
      (existsSync as Mock).mockReturnValue(false);
      (mkdirSync as Mock).mockImplementation(() => { throw new Error('Error creating directory') })

      const file = File.create('/path/to/file.txt', false)
      expect(() => file.move('/path/to/file2.txt')).toThrow(FilesystemError)
    })

    it('should throw error when file cannot be moved', () => {
      (renameSync as Mock).mockImplementation(() => { throw new Error('Cannot move file') })

      const file = File.create('/path/to/file.txt', false)
      // @ts-expect-error - Testing private method
      file.getTargetFile = () => File.create('/path/to/file2.txt', false)
      expect(() => file.move('/path/to/file2.txt')).toThrow(FilesystemError)
    })
  })

  describe('getEncodedAbsolutePath', () => {
    it('should return the encoded absolute path of the file', () => {
      (resolve as Mock).mockReturnValue('/absolute/path/to/file.txt')
      const file = File.create('/path/to/file.txt', false)
      const encodedAbsolutePath = file.getEncodedAbsolutePath()
      expect(encodedAbsolutePath).toBe(encodeURI('/absolute/path/to/file.txt'))
    })
  })

  describe('getEncodedPath', () => {
    it('should return the encoded path of the file', () => {
      (resolve as Mock).mockReturnValue('/absolute/path/to/file.txt')
      const file = File.create('/path/to/file.txt', false)
      const encodedPath = file.getEncodedPath()
      expect(encodedPath).toBe(encodeURI('/path/to/file.txt'))
    })
  })

  describe('exists', () => {
    it('should return true if the file exists', () => {
      (existsSync as Mock).mockReturnValue(true)
      const file = File.create('/path/to/file.txt', true)
      expect(file.exists()).toBe(true)
    })

    it('should return false if the file does not exist', () => {
      (existsSync as Mock).mockReturnValue(false)
      const file = File.create('/path/to/file.txt', false)
      expect(file.exists()).toBe(false)
    })
  })

  describe('isPathPrefix', () => {
    it('should return true if it is the file path prefix', () => {
      const file = File.create('/path/to/dir', false)
      expect(file.isPathPrefix('/path/')).toBe(true)
    })

    it('should return false if it is not the file path prefix', () => {
      (resolve as Mock).mockImplementation((p: string) => p)
      const file = File.create('/path/to/file.txt', false)
      expect(file.isPathPrefix('/pathsss/')).toBe(false)
    })
  })

  describe('isCompressed', () => {
    it('should return true if file is compressed', () => {
      (extname as Mock).mockReturnValue('.gz')
      const file = File.create('/path/to/dir/file.tx.gz', false)
      expect(file.isCompressed()).toBe(true)
    })

    it('should return false if file is not compressed', () => {
      (extname as Mock).mockReturnValue('.tx')
      const file = File.create('/path/to/dir/file.tx', false)
      expect(file.isCompressed()).toBe(false)
    })
  })

  describe('isDir', () => {
    it('should return true if the file is a directory', () => {
      (statSync as Mock).mockReturnValue({ isDirectory: () => true })
      const file = File.create('/path/to/dir', false)
      expect(file.isDir()).toBe(true)
    })

    it('should return false if the file is not a directory', () => {
      (statSync as Mock).mockReturnValue({})
      const file = File.create('/path/to/file.txt', false)
      expect(file.isDir()).toBe(false)
    })
  })

  describe('isWritable', () => {
    it('should return true if the file is isWritable', () => {
      (accessSync as Mock).mockReturnValue(true)
      const file = File.create('/path/to/dir', false)
      expect(file.isWritable()).toBe(true)
    })

    it('should return false if the file is not isWritable', () => {
      (accessSync as Mock).mockImplementation(() => { throw new Error('No access') })
      const file = File.create('/path/to/file.txt', false)
      expect(file.isWritable()).toBe(false)
    })
  })

  describe('isReadable', () => {
    it('should return true if the file is isReadable', () => {
      (accessSync as Mock).mockReturnValue(true)
      const file = File.create('/path/to/dir', false)
      expect(file.isReadable()).toBe(true)
    })

    it('should return false if the file is not isReadable', () => {
      (accessSync as Mock).mockImplementation(() => { throw new Error('No access') })
      const file = File.create('/path/to/file.txt', false)
      expect(file.isReadable()).toBe(false)
    })
  })

  describe('isExecutable', () => {
    it('should return true if the file is an Executable', () => {
      (accessSync as Mock).mockReturnValue(true)
      const file = File.create('/path/to/dir', false)
      expect(file.isExecutable()).toBe(true)
    })

    it('should return false if the file is not an Executable', () => {
      (accessSync as Mock).mockImplementation(() => { throw new Error('No access') })
      const file = File.create('/path/to/file.txt', false)
      expect(file.isExecutable()).toBe(false)
    })
  })

  it('should invoke getters', () => {
    (isAbsolute as Mock).mockReturnValue(true);
    (basename as Mock).mockReturnValue('file.txt');
    (dirname as Mock).mockReturnValue('/path/to/');
    (statSync as Mock).mockReturnValue({
      isFile: () => true,
      isSymbolicLink: () => false,
      atimeMs: 1630000000000,
      mtimeMs: 1630000000000,
      ctimeMs: 1630000000000
    })
    const file = File.create('/path/to/file.txt', false)
    expect(file.getBasename()).toBe('file.txt')
    expect(file.getFilename()).toBe('file.txt')
    expect(file.getName()).toBe('file.txt')
    expect(file.getDirname()).toBe('/path/to/')
    expect(file.getATime()).toBe(1630000000000)
    expect(file.getMTime()).toBe(1630000000000)
    expect(file.getCTime()).toBe(1630000000000)
    expect(file.isFile()).toBe(true)
    expect(file.isLink()).toBe(false)
    expect(file.isAbsolute()).toBe(true)
  })

  it('should invoke getters on invalid values', () => {
    // False check
    (statSync as Mock).mockReturnValue({})
    const file = File.create('/path/to/file.txt', false)
    expect(file.isFile()).toBe(false)
    expect(file.isLink()).toBe(false)
  })

  describe('bug fixes', () => {
    it('move falls back to copy+delete on EXDEV', () => {
      (accessSync as Mock).mockImplementation(() => {});
      (rmSync as Mock).mockImplementation(() => {});
      (copyFileSync as Mock).mockImplementation(() => {});
      (existsSync as Mock).mockReturnValue(true);
      (renameSync as Mock).mockImplementationOnce(() => { const e: any = new Error('cross-device'); e.code = 'EXDEV'; throw e });
      (join as Mock).mockReturnValue('/dest/file.txt')

      const file = File.create('/src/file.txt', false)
      file.move('/dest')

      expect(copyFileSync).toHaveBeenCalled()
      expect(rmSync).toHaveBeenCalledWith('/src/file.txt', { force: true })
    })

    it('move throws a FilesystemError on a non-EXDEV rename failure', () => {
      (existsSync as Mock).mockReturnValue(true);
      (renameSync as Mock).mockImplementationOnce(() => { throw new Error('EPERM') });
      (join as Mock).mockReturnValue('/dest/file.txt')

      const file = File.create('/src/file.txt', false)
      expect(() => file.move('/dest')).toThrow(FilesystemError)
    })

    it('move throws when the EXDEV copy fallback itself fails', () => {
      (accessSync as Mock).mockImplementation(() => {});
      (existsSync as Mock).mockReturnValue(true);
      (renameSync as Mock).mockImplementationOnce(() => { const e: any = new Error('x'); e.code = 'EXDEV'; throw e });
      (copyFileSync as Mock).mockImplementationOnce(() => { throw new Error('disk full') });
      (join as Mock).mockReturnValue('/dest/file.txt')

      expect(() => File.create('/src/file.txt', false).move('/dest')).toThrow(FilesystemError)
    })

    it('isLink uses lstat so a symlink is detected', () => {
      (lstatSync as Mock).mockReturnValueOnce({ isSymbolicLink: () => true })
      expect(File.create('/link', false).isLink()).toBe(true)
    })

    it('isLink returns false when lstat throws (missing path)', () => {
      (lstatSync as Mock).mockImplementationOnce(() => { throw new Error('ENOENT') })
      expect(File.create('/missing', false).isLink()).toBe(false)
    })

    it('getStats never throws for a missing file (predicates return false)', () => {
      (statSync as Mock).mockImplementationOnce(() => { throw new Error('ENOENT') })
      const file = File.create('/missing', false)
      expect(file.isFile()).toBe(false)
      expect(file.getSize()).toBeUndefined()
    })

    it('isPathPrefix requires a real boundary', () => {
      (resolve as Mock).mockImplementation((p: string) => p)
      expect(File.create('/tmp/foo/bar', false).isPathPrefix('/tmp/foo')).toBe(true)
      expect(File.create('/tmp/foo/bar', false).isPathPrefix('/tmp/foo/')).toBe(true)
      expect(File.create('/tmp/foo-evil', false).isPathPrefix('/tmp/foo')).toBe(false)
    })

    it('move still succeeds when chmod fails (best-effort)', () => {
      (accessSync as Mock).mockImplementation(() => {});
      (existsSync as Mock).mockReturnValue(true);
      (renameSync as Mock).mockReturnValue(true);
      (chmodSync as Mock).mockImplementationOnce(() => { throw new Error('EPERM') });
      (join as Mock).mockReturnValue('/dest/file.txt')

      expect(() => File.create('/src/file.txt', false).move('/dest')).not.toThrow()
    })

    it('getTargetFile sanitizes the target name (no traversal)', () => {
      (accessSync as Mock).mockImplementation(() => {});
      (existsSync as Mock).mockReturnValue(true);
      (renameSync as Mock).mockReturnValue(true);
      (basename as Mock).mockImplementation((p: string) => p.split('/').pop());
      (join as Mock).mockImplementation((...args: string[]) => args.join('/'))

      const file = File.create('/src/file.txt', false)
      const moved = file.move('/dest', '../../evil.txt')
      // basename strips the traversal → stays inside /dest.
      expect(moved.getPath()).toBe('/dest/evil.txt')
    })
  })
})
