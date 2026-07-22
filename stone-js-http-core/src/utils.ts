import send from 'send'
import bytes from 'bytes'
import Busboy from 'busboy'
import typeIs from 'type-is'
import { tmpdir } from 'node:os'
import { once } from 'node:events'
import contentType from 'content-type'
import { randomUUID } from 'node:crypto'
import { extname, join } from 'node:path'
import ipRangeCheck from 'ip-range-check'
import { rm } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { IncomingHttpHeaders, IncomingMessage, OutgoingMessage } from 'node:http'
import { StreamFileOptions } from './declarations'
import { NotFoundError } from './errors/NotFoundError'
import { BadRequestError } from './errors/BadRequestError'
import { OutgoingHttpResponse } from './OutgoingHttpResponse'
import { InternalServerError } from './errors/InternalServerError'
import { File, UploadedFile, FilesystemError } from '@stone-js/filesystem'

/**
 * Decorator response callback.
 *
 * @param target - The target function.
 * @param responseCallback - The response callback.
 * @returns The function with the response callback.
 */
export function decoratorResponseCallback<TTarget, TFunction, UReturn extends OutgoingHttpResponse> (
  target: TTarget,
  responseCallback: (content: any) => Promise<UReturn>
): TFunction {
  return async function (this: TTarget, ...args: any[]): Promise<UReturn> {
    const content = await (target as Function).apply(this, args)
    return await responseCallback(content)
  } as TFunction
}

/**
 * Check if multipart message.
 *
 * @param value - The incoming message or content type string.
 * @returns True if the content type is multipart.
 */
export function isMultipart (value: IncomingMessage | string): boolean {
  return typeof value === 'string'
    ? typeIs.is(value, ['multipart']) === 'multipart'
    : typeIs(value, ['multipart']) === 'multipart'
}

/**
 * Get message content type.
 *
 * @param value - The incoming message or content type string.
 * @param fallback - Fallback content type if parsing fails.
 * @returns The content type of the message.
 */
export function getType (value: IncomingMessage | string, fallback: string = 'text/plain'): string {
  try {
    return contentType.parse(value).type
  } catch {
    return fallback
  }
}

/**
 * Get message content charset.
 *
 * @param value - The incoming message or content type string.
 * @param fallback - Fallback charset if parsing fails.
 * @returns The charset of the message.
 */
export function getCharset (value: IncomingMessage | string, fallback: string = 'utf-8'): string {
  try {
    return contentType.parse(value).parameters.charset
  } catch {
    return fallback
  }
}

/**
 * Check if IP is trusted or not.
 *
 * @param trusted - Array of trusted IPs or wildcard.
 * @param untrusted - Array of untrusted IPs or wildcard.
 * @returns A function to verify if a given IP is trusted.
 */
export function isIpTrusted (trusted: string | string[], untrusted: string | string[] = []): (ip: string) => boolean {
  return (ip: string): boolean => {
    if (untrusted.includes('*') || ipRangeCheck(ip, untrusted)) {
      return false
    }

    return trusted.includes('*') || ipRangeCheck(ip, trusted)
  }
}

/**
 * Get protocol.
 *
 * @param ip - The IP address of the request.
 * @param headers - The headers from the incoming request.
 * @param encrypted - Whether the connection is encrypted (HTTPS).
 * @param options - Options for trusted and untrusted IPs.
 * @returns The protocol (http or https).
 */
export function getProtocol (
  ip: string,
  headers: IncomingHttpHeaders,
  encrypted: boolean,
  { trustedIp, untrustedIp }: { trustedIp: string[], untrustedIp: string[] }
): string {
  let protocol = encrypted ? 'https' : 'http'

  if (isIpTrusted(trustedIp, untrustedIp)(ip)) {
    // Incoming header names are always lower-cased (Node, Fetch Headers). The old mixed-case
    // read (`X-Forwarded-Proto`) was dead code.
    protocol = (headers['x-forwarded-proto'] as string)?.split(',').shift()?.trim() ?? protocol
  }

  return protocol
}

/**
 * Validate hostname.
 *
 * @param hostname - The hostname to validate.
 * @returns True if the hostname is valid, false otherwise.
 */
export function isValidHostname (hostname: string): boolean {
  // Allow IPv6 literals in brackets
  if (/^\[([0-9a-fA-F:]+)\]$/.test(hostname)) return true

  // Reject purely numeric strings (e.g., "12345")
  if (/^\d+$/.test(hostname)) return false

  // Reject if too long
  if (hostname.length > 255) return false

  // Reject if it ends with a dot (in normalized form)
  if (hostname.endsWith('.')) return false

  // Safe hostname pattern
  return /^(?!-)[a-zA-Z0-9-]{1,63}(?:\.(?!-)[a-zA-Z0-9-]{1,63})*$/.test(hostname)
}

/**
 * Get hostname.
 *
 * @param ip - The IP address of the request.
 * @param headers - The headers from the incoming request.
 * @param options - Options for trusted IPs, fallback, etc.
 * @returns The hostname from the request.
 */
export function getHostname (
  ip: string,
  headers: IncomingHttpHeaders,
  { trusted, trustedIp, untrustedIp }: { trusted: Array<string | RegExp>, trustedIp: string[], untrustedIp: string[] }
): string | undefined {
  let hostname = headers.host

  if (isIpTrusted(trustedIp, untrustedIp)(ip)) {
    // Header names are always lower-cased; the mixed-case reads were dead code.
    hostname = (headers['x-forwarded-host'] as string)?.split(',').shift() ?? hostname
  }

  if (hostname === undefined) return hostname

  const match = /\[([0-9a-fA-F:]+)\]/.exec(hostname) ?? undefined

  if (match !== undefined) {
    hostname = `[${match[1]}]`
  } else {
    hostname = hostname.trim().replace(/:\d+$/, '').toLowerCase()
  }

  if (!isValidHostname(hostname)) {
    throw new BadRequestError(`SuspiciousOperation: Invalid Host ${hostname} with ip(${ip})`)
  }

  if (trusted?.length > 0) {
    const isValid = trusted.some((pattern) => (pattern instanceof RegExp && pattern.test(hostname)) || pattern === hostname)

    if (!isValid) {
      throw new BadRequestError(`SuspiciousOperation: Untrusted Host ${hostname} with ip(${ip})`)
    }
  }

  return hostname
}

/**
 * Get file uploads.
 *
 * Get streamed or pre-read(not streamed) file upload.
 *
 * @param event - The incoming event containing the file data.
 * @param options - The options for file upload limits.
 * @returns A promise that resolves with the uploaded files and fields.
 */
export async function getFilesUploads (
  event: IncomingMessage | { headers: IncomingHttpHeaders, body: unknown },
  options: Record<string, any>
): Promise<{ files: Record<string, UploadedFile[]>, fields: Record<string, string> }> {
  return await new Promise((resolve, reject) => {
    // Secure-by-default limits: a multipart upload is NOT bounded by the global `body.limit`, so
    // without these an attacker could stream an arbitrarily large file and exhaust the disk (DoS).
    // Callers can raise/lower each via `stone.http.files.upload.limits`.
    options.limits = {
      fileSize: bytes.parse(options.limits?.fileSize) ?? bytes.parse('10mb'),
      fieldSize: bytes.parse(options.limits?.fieldSize) ?? bytes.parse('1mb'),
      fieldNameSize: bytes.parse(options.limits?.fieldNameSize) ?? 100,
      files: options.limits?.files ?? 20,
      fields: options.limits?.fields ?? 1000,
      parts: options.limits?.parts ?? 1020,
      ...options.limits
    }

    const createdFiles: string[] = []
    const writePromises: Array<Promise<void>> = []
    const busboy = Busboy({ headers: event.headers, ...options })
    const result: { files: Record<string, UploadedFile[]>, fields: Record<string, string> } = { files: {}, fields: {} }

    // Best-effort removal of every temp file already written, so a failed/aborted upload never
    // leaks files on disk (combined with the limits above, prevents disk exhaustion).
    const cleanup = async (): Promise<void> => {
      await Promise.all(createdFiles.map(async (path) => await rm(path, { force: true }).catch(() => {})))
    }
    const fail = (error: Error): void => { void cleanup().finally(() => reject(error)) }

    busboy
      .on('field', (fieldname, value) => { result.fields[fieldname] = value })
      .on('file', (fieldname, file, { filename, mimeType }) => {
        result.files[fieldname] ??= []
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        const originalExt = extname(filename) || '.tmp'
        const filepath = join(tmpdir(), `${String(options.prefix ?? 'file')}-${randomUUID()}${originalExt}`)
        const writeStream = createWriteStream(filepath)
        createdFiles.push(filepath)

        const writePromise = once(writeStream, 'close').then(() => {
          result.files[fieldname].push(UploadedFile.createFile(filepath, filename, mimeType))
        })

        writePromises.push(writePromise)

        file.pipe(writeStream)

        // Busboy emits `limit` on the file stream when `fileSize` is exceeded: reject loudly.
        file.on('limit', () => fail(new BadRequestError(`Uploaded file "${filename}" exceeds the allowed size limit.`)))
        file.on('error', error => fail(new FilesystemError(error.message, { cause: error })))
        writeStream.on('error', error => fail(new FilesystemError(error.message, { cause: error })))
      })
      .on('filesLimit', () => fail(new BadRequestError('Too many files uploaded.')))
      .on('fieldsLimit', () => fail(new BadRequestError('Too many form fields.')))
      .on('partsLimit', () => fail(new BadRequestError('Too many multipart parts.')))
      .on('error', (error: any) => fail(new FilesystemError(error.message, { cause: error })))
      .on('close', () => {
        Promise
          .all(writePromises)
          .then(() => resolve(result))
          .catch((error: any) => fail(new FilesystemError('Error while completing file writes', { cause: error })))
      })

    if (event instanceof IncomingMessage) { // Handle streamed file uploads.
      event.pipe(busboy)
      event.on('error', (error: any) => fail(new InternalServerError(error.message, { cause: error })))
    } else { // Handle pre-read file uploads.
      busboy.write(event.body)
      busboy.end()
    }
  })
}

/**
 * Stream files from the file system as an HTTP response.
 *
 * Only for node http server.
 *
 * @param message - The incoming message.
 * @param response - The outgoing response.
 * @param fileResponse - The binary file response to be streamed.
 * @param options - The options for streaming.
 * @returns A promise that resolves when the file streaming is complete.
 */
export async function streamFile (
  message: IncomingMessage,
  response: OutgoingMessage,
  fileResponse: File,
  options: StreamFileOptions
): Promise<void> {
  return await new Promise((resolve, reject) => {
    const file = send(message, fileResponse.getEncodedPath(), options)

    response
      .on('finish', resolve)
      .on('close', (): void => reject(new BadRequestError('Request aborted by client.')))

    file
      .on('error', (error: any): void => reject(new InternalServerError(error.message, { cause: error })))
      .on('headers', (resp) => Object.entries(options.headers ?? {}).forEach(([key, value]) => resp.setHeader(key, value)))
      .on('directory', () => reject(new NotFoundError('EISDIR, read')))
      .on('end', resolve)
      .pipe(response)
  })
}
