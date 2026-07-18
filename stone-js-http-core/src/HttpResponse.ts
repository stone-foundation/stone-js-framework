import {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_FORBIDDEN,
  HTTP_NO_CONTENT,
  HTTP_BAD_REQUEST,
  HTTP_UNAUTHORIZED,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_SERVICE_UNAVAILABLE,
  HTTP_INTERNAL_SERVER_ERROR
} from './constants'
import { File } from '@stone-js/filesystem'
import { HeadersType } from './declarations'
import { JsonResponse } from './JsonResponse'
import { JsonpResponse } from './JsonpResponse'
import { RedirectResponse } from './RedirectResponse'
import { BinaryFileResponse } from './BinaryFileResponse'
import { OutgoingHttpResponse } from './OutgoingHttpResponse'

/**
 * Create an OutgoingHttpResponse.
 *
 * @param content - The content of the response.
 * @param statusCode - The status code of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of OutgoingHttpResponse.
 */
export const createHttpResponse = (content: unknown, statusCode: number = HTTP_OK, headers: HeadersType = {}): OutgoingHttpResponse => {
  return OutgoingHttpResponse.create({ content, statusCode, headers })
}

/**
 * Create a 200(OK) OutgoingHttpResponse.
 *
 * @param content - The content of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of OutgoingHttpResponse.
 */
export const okHttpResponse = (content: unknown, headers: HeadersType = {}): OutgoingHttpResponse => {
  return createHttpResponse(content, HTTP_OK, headers)
}

/**
 * Create a 204(No Content) OutgoingHttpResponse.
 *
 * @param headers - The headers for the response.
 * @returns A new instance of OutgoingHttpResponse.
 */
export const noContentHttpResponse = (headers: HeadersType = {}): OutgoingHttpResponse => {
  return createHttpResponse(undefined, HTTP_NO_CONTENT, headers)
}

/**
 * Create a 400(Bad Request) OutgoingHttpResponse.
 *
 * @param content - The content of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of OutgoingHttpResponse.
 */
export const badRequestHttpResponse = (content: unknown, headers: HeadersType = {}): OutgoingHttpResponse => {
  return createHttpResponse(content, HTTP_BAD_REQUEST, headers)
}

/**
 * Create a 401(Unauthorized) OutgoingHttpResponse.
 *
 * @param content - The content of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of OutgoingHttpResponse.
 */
export const unauthorizedHttpResponse = (content: unknown, headers: HeadersType = {}): OutgoingHttpResponse => {
  return createHttpResponse(content, HTTP_UNAUTHORIZED, headers)
}

/**
 * Create a 403(Forbidden) OutgoingHttpResponse.
 *
 * @param content - The content of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of OutgoingHttpResponse.
 */
export const forbiddenHttpResponse = (content: unknown, headers: HeadersType = {}): OutgoingHttpResponse => {
  return createHttpResponse(content, HTTP_FORBIDDEN, headers)
}

/**
 * Create a 404(Not Found) OutgoingHttpResponse.
 *
 * @param content - The content of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of OutgoingHttpResponse.
 */
export const notFoundHttpResponse = (content: unknown, headers: HeadersType = {}): OutgoingHttpResponse => {
  return createHttpResponse(content, HTTP_NOT_FOUND, headers)
}

/**
 * Create a 405(Method Not Allowed) OutgoingHttpResponse.
 *
 * @param content - The content of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of OutgoingHttpResponse.
 */
export const methodNotAllowedHttpResponse = (content: unknown, headers: HeadersType = {}): OutgoingHttpResponse => {
  return createHttpResponse(content, HTTP_METHOD_NOT_ALLOWED, headers)
}

/**
 * Create a 500(Internal Server Error) OutgoingHttpResponse.
 *
 * @param content - The content of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of OutgoingHttpResponse.
 */
export const serverErrorHttpResponse = (content: unknown, headers: HeadersType = {}): OutgoingHttpResponse => {
  return createHttpResponse(content, HTTP_INTERNAL_SERVER_ERROR, headers)
}

/**
 * Create a 503(Service Unavailable) OutgoingHttpResponse.
 *
 * @param content - The content of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of OutgoingHttpResponse.
 */
export const unavailableHttpResponse = (content: unknown, headers: HeadersType = {}): OutgoingHttpResponse => {
  return createHttpResponse(content, HTTP_SERVICE_UNAVAILABLE, headers)
}

/**
 * Create a 200(OK) HTML OutgoingHttpResponse.
 *
 * @param content - The content of the response.
 * @param statusCode - The status code of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of OutgoingHttpResponse.
 */
export const htmlHttpResponse = (content: string, statusCode: number = HTTP_OK, headers: HeadersType = {}): OutgoingHttpResponse => {
  return createHttpResponse(content, statusCode, { 'Content-Type': 'text/html', ...headers })
}

/**
 * Create a 200(OK) JSON OutgoingHttpResponse.
 *
 * @param content - The content of the response.
 * @param statusCode - The status code of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of JsonResponse.
 */
export const jsonHttpResponse = (content: unknown, statusCode: number = HTTP_OK, headers: HeadersType = {}): JsonResponse => {
  return JsonResponse.create({ content, statusCode, headers })
}

/**
 * Create a 200(OK) JSONP OutgoingHttpResponse.
 *
 * @param content - The content of the response.
 * @param statusCode - The status code of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of JsonpResponse.
 */
export const jsonpHttpResponse = (content: unknown, statusCode: number = HTTP_OK, headers: HeadersType = {}): JsonpResponse => {
  return JsonpResponse.create({ content, statusCode, headers })
}

/**
 * Create a 200(OK) file OutgoingHttpResponse.
 *
 * @param file - The file to send as the response.
 * @param statusCode - The status code of the response.
 * @param headers - The headers for the response.
 * @param contentDispositionType - The content disposition type (e.g., "inline" or "attachment").
 * @param autoEtag - Whether to automatically generate an ETag.
 * @param autoLastModified - Whether to automatically set the Last-Modified header.
 * @returns A new instance of BinaryFileResponse.
 */
export const fileHttpResponse = (
  file: string | File,
  statusCode: number = HTTP_OK,
  headers: HeadersType = {},
  contentDispositionType: string | null = null,
  autoEtag: boolean = false,
  autoLastModified: boolean = true
): BinaryFileResponse => {
  return BinaryFileResponse.create({ content: undefined, file, statusCode, headers, contentDispositionType, autoEtag, autoLastModified })
}

/**
 * Create a 302(Redirect) OutgoingHttpResponse.
 *
 * @param url - The URL to redirect to.
 * @param statusCode - The status code of the redirect response.
 * @param headers - The headers for the response.
 * @returns A new instance of RedirectResponse.
 */
export const redirectHttpResponse = (url: string | URL, statusCode: number = 302, headers: HeadersType = {}): RedirectResponse => {
  return RedirectResponse.create({ content: undefined, url, statusCode, headers })
}

/**
 * Create a 204(No content) empty JSON OutgoingHttpResponse.
 *
 * @param statusCode - The status code of the response.
 * @param headers - The headers for the response.
 * @returns A new instance of OutgoingHttpResponse.
 */
export const emptyHttpResponse = (statusCode: number = 204, headers: HeadersType = {}): OutgoingHttpResponse => {
  return createHttpResponse(undefined, statusCode, { 'Content-Type': 'application/json', ...headers })
}
