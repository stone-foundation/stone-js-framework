import mime from 'mime'
import { Mock } from 'vitest'
import { existsSync } from 'node:fs'
import { File } from '../../src/file/File'
import { basename, extname } from 'node:path'
import { UploadedFile } from '../../src/file/UploadedFile'
import { FilesystemError } from '../../src/errors/FilesystemError'

vi.mock('mime')
vi.mock('node:path')
vi.mock('node:fs', () => ({
  existsSync: vi.fn()
}))

/**
 * Unit tests for the UploadedFile class.
 */
describe('UploadedFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (existsSync as Mock).mockReturnValue(true)
  })

  describe('constructor', () => {
    it('should create an instance of UploadedFile with correct properties', () => {
      (basename as Mock).mockReturnValue('original-name.txt')
      const uploadedFile = UploadedFile.createFile('/path/to/file.txt', 'original-name.txt', 'text/plain')

      expect(uploadedFile).toBeInstanceOf(UploadedFile)
      expect(uploadedFile.getClientOriginalName()).toBe('original-name.txt')
      expect(uploadedFile.getClientMimeType()).toBe('text/plain')
    })

    it('should use default MIME type if not provided', () => {
      (basename as Mock).mockReturnValue('original-name.txt')
      const uploadedFile = new UploadedFile('/path/to/file.txt', 'original-name.txt')

      expect(uploadedFile.getClientMimeType()).toBe('application/octet-stream')
    })
  })

  describe('getClientOriginalName', () => {
    it('should return the original name of the uploaded file', () => {
      (basename as Mock).mockReturnValue('original-name.txt')
      const uploadedFile = new UploadedFile('/path/to/file.txt', 'original-name.txt')
      expect(uploadedFile.getClientOriginalName()).toBe('original-name.txt')
    })
  })

  describe('getClientOriginalExtension', () => {
    it('should return the original file extension', () => {
      (extname as Mock).mockReturnValue('.txt')
      const uploadedFile = new UploadedFile('/path/to/file.txt', 'original-name.txt')
      expect(uploadedFile.getClientOriginalExtension()).toBe('.txt')
    })
  })

  describe('getClientMimeType', () => {
    it('should return the MIME type of the uploaded file', () => {
      const uploadedFile = new UploadedFile('/path/to/file.txt', 'original-name.txt', 'text/plain')
      expect(uploadedFile.getClientMimeType()).toBe('text/plain')
    })
  })

  describe('guessClientExtension', () => {
    it('should guess the file extension based on the MIME type', () => {
      (mime.getExtension as Mock).mockReturnValue('txt')
      const uploadedFile = new UploadedFile('/path/to/file.txt', 'original-name.txt', 'text/plain')
      expect(uploadedFile.guessClientExtension()).toBe('txt')
      expect(mime.getExtension).toHaveBeenCalledWith('text/plain')
    })

    it('should return undefined if MIME type is not recognized', () => {
      (mime.getExtension as Mock).mockReturnValue(undefined)
      const uploadedFile = new UploadedFile('/path/to/file.txt', 'original-name.txt', 'unknown/type')
      expect(uploadedFile.guessClientExtension()).toBeUndefined()
    })
  })

  describe('isValid', () => {
    it('should return true if the file exists', () => {
      (existsSync as Mock).mockReturnValue(true)
      const uploadedFile = new UploadedFile('/path/to/file.txt', 'original-name.txt')
      expect(uploadedFile.isValid()).toBe(true)
    })
  })

  describe('move', () => {
    it('should move the file to the specified directory if it is valid', () => {
      const targetPath = '/new/path/to/file.txt'
      const uploadedFile = new UploadedFile('/path/to/file.txt', 'original-name.txt', 'text/plain', false)
      File.prototype.move = vi.fn().mockReturnValue(UploadedFile.create(targetPath, false))

      const movedFile = uploadedFile.move('/new/path')

      expect(movedFile).toBeInstanceOf(UploadedFile)
      expect(movedFile.getPath()).toBe(targetPath)
    })

    it('should throw an error if the file is not valid', () => {
      (existsSync as Mock).mockReturnValue(false)
      const uploadedFile = new UploadedFile('/path/to/file.txt', 'original-name.txt', 'text/plain', false)
      expect(() => uploadedFile.move('/new/path')).toThrow(FilesystemError)
      expect(() => uploadedFile.move('/new/path')).toThrow('No file was uploaded.')
    })
  })
})
