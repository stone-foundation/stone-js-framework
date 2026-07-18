import { EventEmitter } from 'node:events'
import { createWriteStream } from 'node:fs'
import { NotFoundError } from '../src/errors/NotFoundError'
import { BadRequestError } from '../src/errors/BadRequestError'
import { InternalServerError } from '../src/errors/InternalServerError'
import { File, FilesystemError, UploadedFile } from '@stone-js/filesystem'
import { IncomingMessage, IncomingHttpHeaders, OutgoingMessage } from 'http'
import {
  getCharset,
  getHostname,
  getProtocol,
  getType,
  isIpTrusted,
  isMultipart,
  streamFile,
  getFilesUploads,
  isValidHostname,
  decoratorResponseCallback
} from '../src/utils'

// Mocking values and spies
let MockSend: any
let MockBusboy: any
const MockSendOnSpy = vi.fn()

// Per-test upload behaviour configuration
let writeStreamBehavior: 'close' | 'error'
let fileStreamError: Error | null
let busboyError: Error | null

// Mocking dependencies
vi.mock('node:fs')
vi.mock('node:os')
vi.mock('node:path')
vi.mock('send', () => ({ default: (..._args: any[]) => (MockSend) }))
vi.mock('busboy', () => ({ default: (..._args: any[]) => (MockBusboy) }))

/* eslint-disable @typescript-eslint/no-useless-constructor */

// Mocking IncomingMessage
class MockIncomingMessage extends IncomingMessage {
  constructor (headers: IncomingHttpHeaders) {
    super({} as any)
    this.headers = headers
  }
}

// Mocking OutgoingMessage
class MockOutgoingMessage extends OutgoingMessage {
  constructor () {
    super()
  }
}

// Builds a write-stream-like EventEmitter. `once()` works natively on it.
const createMockWriteStream = (): any => {
  const ws: any = new EventEmitter()
  ws.pipe = vi.fn()
  ws.__behavior = writeStreamBehavior
  return ws
}

// Builds a readable file stream that drives the write stream once the
// source has attached its listeners (deferred via queueMicrotask).
const createMockFileStream = (): any => {
  const file: any = new EventEmitter()
  file.pipe = (ws: any) => {
    queueMicrotask(() => {
      if (fileStreamError !== null) {
        file.emit('error', fileStreamError)
      } else if (ws?.__behavior === 'error') {
        ws.emit('error', Object.assign(new Error('Disk write failed'), { code: 'EIO' }))
      } else {
        ws.emit('close')
      }
    })
  }
  return file
}

describe('Utility Functions', () => {
  beforeEach(() => {
    writeStreamBehavior = 'close'
    fileStreamError = null
    busboyError = null

    MockSend = {
      listeners: {} as any,
      pipe (res: OutgoingMessage) {
        this.emit('headers', res)
        this.emit('end')
      },
      on (event: string, callback: Function) {
        this.listeners[event] = callback
        return this
      },
      emit (event: string, ...args: any[]) {
        this.listeners[event](...args)
        MockSendOnSpy(event)
      },
      error (error: Error) {
        this.emit('error', error)
      },
      directory () {
        this.emit('directory')
      }
    }
    MockBusboy = {
      listeners: {} as any,
      pipe (_req?: IncomingMessage) {
        if (busboyError !== null) {
          this.emit('error', busboyError)
          return
        }
        this.emit('field', 'username', 'test')
        this.emit('file', 'filename', createMockFileStream(), { filename: 'test.txt', mimeType: 'text/plain' })
        this.emit('close')
      },
      write (_data: any) {},
      end () {
        this.pipe()
      },
      on (event: string, callback: Function) {
        this.listeners[event] = callback
        return this
      },
      emit (event: string, ...args: any[]) {
        this.listeners[event]?.(...args)
      }
    }
    vi.mocked(createWriteStream).mockImplementation(() => createMockWriteStream())
    UploadedFile.createFile = vi.fn().mockReturnValue({ filename: 'test.txt', mimeType: 'text/plain' }) as any
  })

  describe('decoratorResponseCallback', () => {
    it('awaits the target and forwards its result to the response callback', async () => {
      const target = vi.fn(async (a: number, b: number) => a + b)
      const responseCallback = vi.fn(async (content: any) => ({ content }))

      const wrapped: any = decoratorResponseCallback(target as any, responseCallback as any)
      const context = { tag: 'ctx' }
      const result = await wrapped.call(context, 3, 4)

      expect(target).toHaveBeenCalledWith(3, 4)
      expect(target.mock.instances[0]).toBe(context)
      expect(responseCallback).toHaveBeenCalledWith(7)
      expect(result).toEqual({ content: 7 })
    })

    it('propagates errors thrown by the target', async () => {
      const target = vi.fn(async () => { throw new Error('boom') })
      const responseCallback = vi.fn(async (content: any) => ({ content }))

      const wrapped: any = decoratorResponseCallback(target as any, responseCallback as any)

      await expect(() => wrapped()).rejects.toThrow('boom')
      expect(responseCallback).not.toHaveBeenCalled()
    })
  })

  describe('isMultipart', () => {
    it('should return true for multipart content type string', () => {
      expect(isMultipart('multipart/form-data')).toBe(true)
    })

    it('should return false for non-multipart content type string', () => {
      expect(isMultipart('application/json')).toBe(false)
    })

    it('should return false for non-multipart IncomingMessage', () => {
      const message = new MockIncomingMessage({ 'content-type': 'application/json' })
      expect(isMultipart(message)).toBe(false)
    })
  })

  describe('getType', () => {
    it('should return content type for IncomingMessage', () => {
      const message = new MockIncomingMessage({ 'content-type': 'application/json' })
      expect(getType(message)).toBe('application/json')
    })

    it('should return content type for a content-type string', () => {
      expect(getType('application/json; charset=utf-8')).toBe('application/json')
    })

    it('should return fallback for invalid content type', () => {
      expect(getType('invalid-content-type', 'text/plain')).toBe('text/plain')
    })

    it('should use the default fallback when none is provided', () => {
      expect(getType('invalid-content-type')).toBe('text/plain')
    })
  })

  describe('getCharset', () => {
    it('should return charset for IncomingMessage', () => {
      const message = new MockIncomingMessage({ 'content-type': 'application/json; charset=utf-8' })
      expect(getCharset(message)).toBe('utf-8')
    })

    it('should return fallback for invalid charset', () => {
      expect(getCharset('invalid-content-type', 'utf-8')).toBe('utf-8')
    })

    it('should use the default fallback when none is provided', () => {
      expect(getCharset('invalid-content-type')).toBe('utf-8')
    })
  })

  describe('isIpTrusted', () => {
    it('should return true for trusted IP', () => {
      expect(isIpTrusted(['192.168.1.1'], [])('192.168.1.1')).toBe(true)
    })

    it('should return false for untrusted IP (wildcard)', () => {
      expect(isIpTrusted(['192.168.1.1'], ['*'])('192.168.1.1')).toBe(false)
    })

    it('should return false when IP is within an untrusted range', () => {
      expect(isIpTrusted(['*'], ['10.0.0.0/8'])('10.1.2.3')).toBe(false)
    })

    it('should return true when IP is within a trusted range', () => {
      expect(isIpTrusted(['10.0.0.0/8'], [])('10.1.2.3')).toBe(true)
    })

    it('should return false when IP matches no trusted entry', () => {
      expect(isIpTrusted(['10.0.0.0/8'], [])('192.168.1.1')).toBe(false)
    })

    it('should default the untrusted list to empty', () => {
      expect(isIpTrusted(['*'])('1.2.3.4')).toBe(true)
    })
  })

  describe('getProtocol', () => {
    it('should return https if encrypted', () => {
      expect(getProtocol('192.168.1.1', {}, true, { trustedIp: [], untrustedIp: [] })).toBe('https')
    })

    it('should return http if not encrypted and IP is trusted', () => {
      expect(getProtocol('192.168.1.1', {}, false, { trustedIp: ['*'], untrustedIp: [] })).toBe('http')
    })

    it('should return forwarded protocol (lowercase header) if IP is trusted', () => {
      expect(getProtocol('192.168.1.1', { 'x-forwarded-proto': 'https' }, false, { trustedIp: ['*'], untrustedIp: [] })).toBe('https')
    })

    it('should ignore a capitalized forwarded header (headers are always lower-cased)', () => {
      // Node/Fetch normalize header names to lower-case; a mixed-case key is never present, so it
      // must NOT be read — the protocol falls back to the connection default.
      expect(getProtocol('192.168.1.1', { 'X-Forwarded-Proto': 'https' } as any, false, { trustedIp: ['*'], untrustedIp: [] })).toBe('http')
    })

    it('should pick the first protocol when several are forwarded', () => {
      expect(getProtocol('192.168.1.1', { 'x-forwarded-proto': 'https, http' }, false, { trustedIp: ['*'], untrustedIp: [] })).toBe('https')
    })

    it('should ignore the forwarded protocol for an untrusted IP', () => {
      expect(getProtocol('9.9.9.9', { 'x-forwarded-proto': 'https' }, false, { trustedIp: [], untrustedIp: ['*'] })).toBe('http')
    })
  })

  describe('isValidHostname', () => {
    it('accepts simple hostnames', () => {
      expect(isValidHostname('example.com')).toBe(true)
      expect(isValidHostname('api.dev.example.com')).toBe(true)
      expect(isValidHostname('localhost')).toBe(true)
    })

    it('accepts IPv6 literals in brackets', () => {
      expect(isValidHostname('[2001:db8::1]')).toBe(true)
      expect(isValidHostname('[fe80::1ff:fe23:4567:890a]')).toBe(true)
    })

    it('rejects malformed IPv6 in brackets', () => {
      expect(isValidHostname('[2001:db8::1')).toBe(false)
      expect(isValidHostname('2001:db8::1]')).toBe(false)
      expect(isValidHostname('[ghij::1234]')).toBe(false)
    })

    it('rejects numeric-only strings', () => {
      expect(isValidHostname('123')).toBe(false)
      expect(isValidHostname('00123')).toBe(false)
    })

    it('rejects labels starting with dash', () => {
      expect(isValidHostname('-example.com')).toBe(false)
      expect(isValidHostname('api.-example.com')).toBe(false)
    })

    it('rejects trailing dot', () => {
      expect(isValidHostname('example.com.')).toBe(false)
    })

    it('rejects double dots or empty labels', () => {
      expect(isValidHostname('a..b')).toBe(false)
      expect(isValidHostname('.example.com')).toBe(false)
      expect(isValidHostname('example..com')).toBe(false)
    })

    it('rejects hostnames exceeding 255 characters', () => {
      const longLabel = 'a'.repeat(64)
      const longHost = Array(5).fill(longLabel).join('.')
      expect(isValidHostname(longHost)).toBe(false)
    })

    it('rejects empty string', () => {
      expect(isValidHostname('')).toBe(false)
    })
  })

  describe('getHostname', () => {
    it('should return hostname from the host header', () => {
      const headers = { host: 'example.com' }
      const result = getHostname('192.168.1.1', headers, { trusted: [/.+(ample.com)/], trustedIp: ['*'], untrustedIp: [] })
      expect(result).toBe('example.com')
    })

    it('should ignore a capitalized Host header (headers are always lower-cased)', () => {
      const headers = { Host: 'example.com' } as any
      const result = getHostname('1.2.3.4', headers, { trusted: [], trustedIp: [], untrustedIp: [] })
      expect(result).toBeUndefined()
    })

    it('should strip the port and lowercase the hostname', () => {
      const headers = { host: 'EXAMPLE.COM:8443' }
      const result = getHostname('1.2.3.4', headers, { trusted: [], trustedIp: [], untrustedIp: [] })
      expect(result).toBe('example.com')
    })

    it('should return hostname from headers with IPv6', () => {
      const headers = { 'x-forwarded-host': '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]' }
      const result = getHostname('192.168.1.1', headers, { trusted: [], trustedIp: ['192.168.1.1'], untrustedIp: [] })
      expect(result).toBe('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]')
    })

    it('should ignore a capitalized X-Forwarded-Host header (headers are always lower-cased)', () => {
      const headers = { 'X-Forwarded-Host': 'fwd.example.com', host: 'example.com' } as any
      const result = getHostname('1.2.3.4', headers, { trusted: [], trustedIp: ['*'], untrustedIp: [] })
      // The capitalized forwarded header is ignored; falls back to the (lower-cased) Host.
      expect(result).toBe('example.com')
    })

    it('should match a trusted hostname by exact string', () => {
      const headers = { host: 'example.com' }
      const result = getHostname('1.2.3.4', headers, { trusted: ['example.com'], trustedIp: [], untrustedIp: [] })
      expect(result).toBe('example.com')
    })

    it('should return undefined when hostname is undefined', () => {
      const result = getHostname('192.168.1.1', {}, { trusted: [], trustedIp: ['*'], untrustedIp: [] })
      expect(result).toBeUndefined()
    })

    it('should throw error for invalid hostname', () => {
      const headers = { host: 'invalid_hostname' }
      expect(() => getHostname('192.168.1.1', headers, { trusted: [], trustedIp: ['*'], untrustedIp: [] }))
        .toThrow('SuspiciousOperation: Invalid Host invalid_hostname with ip(192.168.1.1)')
    })

    it('should throw error for untrusted hostname', () => {
      const headers = { host: 'untrusted.com' }
      expect(() => getHostname('192.168.1.1', headers, { trusted: ['trusted.com'], trustedIp: ['*'], untrustedIp: [] }))
        .toThrow('SuspiciousOperation: Untrusted Host untrusted.com with ip(192.168.1.1)')
    })
  })

  describe('getFilesUploads', () => {
    it('should resolve with fields and files for pre-read file uploads', async () => {
      const options = { limits: { fileSize: '1mb' } }
      const event = { headers: { 'content-type': 'multipart/form-data' }, body: 'dummy body' }

      const result = await getFilesUploads(event, options)
      expect(result.fields).toEqual({ username: 'test' })
      expect(result.files).toHaveProperty('filename')
    })

    it('should resolve with fields and files for streamed file uploads', async () => {
      const options = { limits: { fileSize: undefined } }
      const event = new MockIncomingMessage({ 'content-type': 'multipart/form-data' })
      event.pipe = (() => MockBusboy.pipe(event)) as any
      event.on = vi.fn() as any

      const result = await getFilesUploads(event, options)
      expect(result.fields).toEqual({ username: 'test' })
      expect(result.files).toHaveProperty('filename')
    })

    it('should default the limits object when none is provided', async () => {
      const event = { headers: { 'content-type': 'multipart/form-data' }, body: 'dummy body' }
      const result = await getFilesUploads(event, {})
      expect(result.files).toHaveProperty('filename')
    })

    it('should use the provided prefix for temporary filenames', async () => {
      const event = { headers: { 'content-type': 'multipart/form-data' }, body: 'dummy body' }
      const result = await getFilesUploads(event, { prefix: 'upload' })
      expect(result.files).toHaveProperty('filename')
    })

    it('should throw an InternalServerError on streamed request error', async () => {
      const options = { limits: { fileSize: undefined } }
      const event = new MockIncomingMessage({ 'content-type': 'multipart/form-data' })
      event.pipe = vi.fn() as any
      event.on = ((_e: string, handler: Function) => handler({ message: 'Error', code: 'EIO' })) as any

      await expect(async () => await getFilesUploads(event, options)).rejects.toThrow(InternalServerError)
    })

    it('should throw a FilesystemError when the write stream errors', async () => {
      writeStreamBehavior = 'error'
      const event = { headers: { 'content-type': 'multipart/form-data' }, body: 'dummy body' }

      await expect(async () => await getFilesUploads(event, {})).rejects.toThrow(FilesystemError)
    })

    it('should throw a FilesystemError when the file stream errors', async () => {
      fileStreamError = new Error('stream broke')
      const event = { headers: { 'content-type': 'multipart/form-data' }, body: 'dummy body' }

      await expect(async () => await getFilesUploads(event, {})).rejects.toThrow(FilesystemError)
    })

    it('should throw a FilesystemError when busboy emits an error', async () => {
      busboyError = new Error('busboy failed')
      const event = { headers: { 'content-type': 'multipart/form-data' }, body: 'dummy body' }

      await expect(async () => await getFilesUploads(event, {})).rejects.toThrow(FilesystemError)
    })
  })

  describe('streamFile', () => {
    it('should handle file streaming successfully', async () => {
      const message = new MockIncomingMessage({})
      const response = new MockOutgoingMessage()
      const file = File.create('test/path', false)

      const res = await streamFile(message, response, file, { headers: { 'content-type': 'application/octet-stream' } })

      expect(res).toBeUndefined()
      expect(MockSendOnSpy).toHaveBeenCalled()
    })

    it('should handle file streaming successfully with no headers options', async () => {
      const message = new MockIncomingMessage({})
      const response = new MockOutgoingMessage()
      const file = File.create('test/path', false)

      // @ts-expect-error - Invalid type
      const res = await streamFile(message, response, file, {})

      expect(res).toBeUndefined()
      expect(MockSendOnSpy).toHaveBeenCalled()
    })

    it('should resolve when the response finishes', async () => {
      const message = new MockIncomingMessage({})
      const response = new MockOutgoingMessage()
      const file = File.create('test/path', false)

      MockSend = {
        ...MockSend,
        pipe (res: any) {
          res.emit('finish')
        }
      }

      const res = await streamFile(message, response, file, {} as any)
      expect(res).toBeUndefined()
    })

    it('should throw an unexpected error while handling file', async () => {
      const message = new MockIncomingMessage({})
      const response = new MockOutgoingMessage()
      const file = File.create('test/path', false)

      MockSend = {
        ...MockSend,
        pipe (_res: OutgoingMessage) {
          this.error(new Error('Unexpected error'))
        }
      }

      await expect(async () => await streamFile(message, response, file, {} as any)).rejects.toThrow(InternalServerError)
    })

    it('should throw a NotFoundError while accessing a directory', async () => {
      const message = new MockIncomingMessage({})
      const response = new MockOutgoingMessage()
      const file = File.create('test/path', false)

      MockSend = {
        ...MockSend,
        pipe (_res: OutgoingMessage) {
          this.directory()
        }
      }

      await expect(async () => await streamFile(message, response, file, {} as any)).rejects.toThrow(NotFoundError)
    })

    it('should throw a BadRequestError on client error', async () => {
      const message = new MockIncomingMessage({})
      const response = new MockOutgoingMessage()
      const file = File.create('test/path', false)

      MockSend = {
        ...MockSend,
        pipe (res: OutgoingMessage) {
          res.emit('close')
        }
      }

      await expect(async () => await streamFile(message, response, file, {} as any)).rejects.toThrow(BadRequestError)
    })
  })
})
