import { FETCH_PLATFORM } from '../constants'
import { IBlueprint, NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { CookieCollection } from '@stone-js/http-core'
import { FetchAdapterError } from '../errors/FetchAdapterError'
import { normalizeRequest, NormalizedRequest } from '../request-normalizer'
import { FetchAdapterContext, FetchAdapterResponseBuilder } from '../declarations'

/**
 * Transforms a Web `Request` into a Stone.js `IncomingHttpEvent`.
 *
 * Fully platform-agnostic: it relies only on Web-standard APIs (`Request`, `URL`, `Headers`), so
 * it runs unchanged on Cloudflare Workers, Deno, Bun and the Edge runtimes — no `node:http`, no
 * `proxy-addr`. The untouched request body is exposed as `metadata.rawBody`; JSON and
 * URL-encoded bodies are additionally parsed into `body`.
 */
export class IncomingEventMiddleware {
  private readonly blueprint: IBlueprint

  /**
   * @param options - The auto-wired blueprint.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Build the incoming event from the request.
   *
   * @param context - The adapter context.
   * @param next - The next middleware.
   * @returns The raw-response builder.
   * @throws {FetchAdapterError} When the context is missing required components.
   */
  async handle (context: FetchAdapterContext, next: NextMiddleware<FetchAdapterContext, FetchAdapterResponseBuilder>): Promise<FetchAdapterResponseBuilder> {
    if (context.rawEvent === undefined || context.incomingEventBuilder?.add === undefined) {
      throw new FetchAdapterError('The context is missing required components.')
    }

    const request = context.rawEvent
    const normalized = await normalizeRequest(request)

    context
      .incomingEventBuilder
      .add('url', normalized.url)
      .add('ip', normalized.ip)
      .add('ips', normalized.ip.length > 0 ? [normalized.ip] : [])
      .addIf('method', normalized.method)
      .add('headers', normalized.headers)
      .add('queryString', normalized.rawQueryString)
      .add('protocol', normalized.url.protocol.replace(':', ''))
      .add('cookies', CookieCollection.create(normalized.cookies.join('; '), this.getCookieOptions(), this.getCookieSecret()))
      .add('body', this.parseBody(normalized))
      .add('metadata', { rawBody: normalized.rawBody })
      .add('source', { rawEvent: request, platform: FETCH_PLATFORM, rawContext: context.executionContext })

    return await next(context)
  }

  /**
   * Parse JSON / URL-encoded bodies into an object; leave everything else to `metadata.rawBody`.
   *
   * @param normalized - The normalized request.
   * @returns The parsed body object, or an empty object.
   */
  private parseBody (normalized: NormalizedRequest): Record<string, unknown> {
    if (typeof normalized.rawBody !== 'string') { return {} }

    const contentType = normalized.headers['content-type'] ?? ''

    try {
      if (contentType.includes('application/json') || contentType.includes('+json')) {
        const parsed: unknown = JSON.parse(normalized.rawBody)
        return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : { value: parsed }
      }

      if (contentType.includes('application/x-www-form-urlencoded')) {
        return Object.fromEntries(new URLSearchParams(normalized.rawBody))
      }
    } catch {
      // A malformed body is left as `metadata.rawBody`; body-less handlers still run.
    }

    return {}
  }

  /**
   * @returns The configured cookie options.
   */
  private getCookieOptions (): Record<string, unknown> {
    return this.blueprint.get<Record<string, unknown>>('stone.http.cookie.options', {})
  }

  /**
   * @returns The configured cookie secret.
   */
  private getCookieSecret (): string {
    return this.blueprint.get<string>('stone.http.cookie.secret', this.blueprint.get<string>('stone.secret', ''))
  }
}

/**
 * Meta middleware for processing incoming Fetch events.
 */
export const MetaIncomingEventMiddleware: MetaMiddleware<any, any> = { module: IncomingEventMiddleware, isClass: true }
