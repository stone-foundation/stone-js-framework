import proxyAddr from 'proxy-addr'
import { IncomingMessage } from 'node:http'
import { TENCENT_SCF_HTTP_PLATFORM } from '../constants'
import { IBlueprint, NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { getRawBody, normalizeHttpEvent, NormalizedHttpEvent } from '../event-normalizer'
import { TencentScfHttpAdapterError } from '../errors/TencentScfHttpAdapterError'
import { getHostname, getProtocol, isIpTrusted, CookieSameSite, CookieCollection } from '@stone-js/http-core'
import { TencentScfHttpAdapterContext, TencentScfHttpAdapterResponseBuilder } from '../declarations'

/**
 * Represents the options for the IncomingEventMiddleware.
 */
interface HttpProxyOptions {
  trusted: string[]
  trustedIp: string[]
  untrustedIp: string[]
}

/**
 * Represents the options for cookies in IncomingEventMiddleware.
 */
interface HttpCommonCookieOptions {
  path?: string
  expires?: Date
  domain?: string
  maxAge?: number
  secure?: boolean
  httpOnly?: boolean
  sameSite?: CookieSameSite
}

/**
 * Middleware for handling incoming events and transforming them into Stone.js events.
 *
 * It first normalizes the raw AWS event (API Gateway v1/v2, ALB, Function URLs) into a single
 * canonical shape, then extracts URL, IP addresses, headers, cookies, query and the raw body,
 * so the pipeline never has to reason about which trigger fired. The untouched request body is
 * always exposed as `metadata.rawBody` — even when no body-parsing middleware is installed — so
 * consumers can read the original payload (e.g. to verify a webhook signature).
 */
export class IncomingEventMiddleware {
  /**
   * The blueprint for resolving configuration and dependencies.
   */
  private readonly blueprint: IBlueprint

  /**
   * Create an IncomingEventMiddleware instance.
   *
   * @param options - Options containing the blueprint for resolving configuration and dependencies.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Handles the incoming event, processes it, and invokes the next middleware in the pipeline.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @param next - The next middleware to be invoked in the pipeline.
   * @returns A promise that resolves to the processed context.
   * @throws {TencentScfHttpAdapterError} If required components are missing in the context.
   */
  async handle (context: TencentScfHttpAdapterContext, next: NextMiddleware<TencentScfHttpAdapterContext, TencentScfHttpAdapterResponseBuilder>): Promise<TencentScfHttpAdapterResponseBuilder> {
    if ((context.rawEvent === undefined) || ((context.incomingEventBuilder?.add) === undefined)) {
      throw new TencentScfHttpAdapterError('The context is missing required components.')
    }

    const event = normalizeHttpEvent(context.rawEvent)
    const proxyOptions = this.getProxyOptions()
    const cookieOptions = this.getCookieOptions()

    context
      .incomingEventBuilder
      .add('url', this.extractUrl(event, proxyOptions))
      .add('ips', this.extractIpAddresses(event, proxyOptions))
      .add('source', this.getSource(context))
      .add('headers', event.headers)
      // Expose the untouched request body so any consumer can read it, regardless of parsing.
      .add('metadata', { rawBody: getRawBody(context.rawEvent) })
      // If not defined by other middleware; in fullstack forms the method is spoofed via a field.
      .addIf('method', event.method)
      .add('queryString', event.rawQueryString)
      .add('protocol', this.getProtocol(event, proxyOptions))
      .add('cookies', CookieCollection.create(event.cookies.join('; '), cookieOptions, this.getCookieSecret()))
      .add('ip', proxyAddr(this.toNodeMessage(event), isIpTrusted(proxyOptions.trustedIp, proxyOptions.untrustedIp)))

    return await next(context)
  }

  /**
   * Create the IncomingEventSource from the context.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @returns The Incoming Event Source.
   */
  private getSource (context: TencentScfHttpAdapterContext): unknown {
    return {
      rawEvent: context.rawEvent,
      platform: TENCENT_SCF_HTTP_PLATFORM,
      rawContext: context.executionContext
    }
  }

  /**
   * Extracts proxy-related options from the blueprint.
   *
   * @returns Proxy options.
   */
  private getProxyOptions (): HttpProxyOptions {
    const defaultProxyOptions: HttpProxyOptions = { trusted: [], trustedIp: [], untrustedIp: [] }
    const proxyOptions = { ...this.blueprint.get<HttpProxyOptions>('stone.http.proxies', defaultProxyOptions) }
    proxyOptions.trusted = this.blueprint.get<string[]>('stone.http.hosts.trusted', [])
    return proxyOptions
  }

  /**
   * Retrieves cookie-related options from the blueprint.
   *
   * @returns Cookie options.
   */
  private getCookieOptions (): HttpCommonCookieOptions {
    return this.blueprint.get<HttpCommonCookieOptions>('stone.http.cookie.options', {})
  }

  /**
   * Retrieves the cookie secret from the blueprint.
   *
   * @returns The cookie secret string.
   */
  private getCookieSecret (): string {
    return this.blueprint.get<string>('stone.http.cookie.secret', this.blueprint.get<string>('stone.secret', ''))
  }

  /**
   * Extracts and parses the URL (including the query string) from the normalized event.
   *
   * @param event - The normalized HTTP event.
   * @param options - Proxy options.
   * @returns The parsed URL object.
   */
  private extractUrl (event: NormalizedHttpEvent, options: HttpProxyOptions): URL {
    const hostname = getHostname(event.sourceIp, event.headers, options)
    const proto = getProtocol(event.sourceIp, event.headers, true, options)
    const pathWithQuery = event.rawQueryString.length > 0 ? `${event.path}?${event.rawQueryString}` : event.path
    return new URL(pathWithQuery, `${String(proto)}://${String(hostname)}`)
  }

  /**
   * Extracts a list of IP addresses from the normalized event.
   *
   * @param event - The normalized HTTP event.
   * @param options - Proxy options.
   * @returns An array of IP addresses.
   */
  private extractIpAddresses (event: NormalizedHttpEvent, options: HttpProxyOptions): string[] {
    const isTrusted = isIpTrusted(options.trustedIp, options.untrustedIp)
    return proxyAddr.all(this.toNodeMessage(event), isTrusted).slice(1).reverse()
  }

  /**
   * Converts the normalized event to a minimal Node.js IncomingMessage for `proxy-addr`.
   *
   * All standard forwarding headers are forwarded (not just `x-forwarded-for`) so proxy-addr can
   * honour the deployment's trust configuration.
   *
   * @param event - The normalized HTTP event.
   * @returns The converted IncomingMessage.
   */
  private toNodeMessage (event: NormalizedHttpEvent): IncomingMessage {
    return {
      connection: { remoteAddress: event.sourceIp },
      socket: { remoteAddress: event.sourceIp },
      headers: {
        forwarded: event.headers.forwarded,
        'x-real-ip': event.headers['x-real-ip'],
        'x-forwarded-for': event.headers['x-forwarded-for'] ?? event.sourceIp
      }
    } as unknown as IncomingMessage
  }

  /**
   * Determines the protocol from the normalized event.
   *
   * @param event - The normalized HTTP event.
   * @param options - Proxy options.
   * @returns The protocol string.
   */
  private getProtocol (event: NormalizedHttpEvent, options: HttpProxyOptions): string {
    return getProtocol(event.sourceIp, event.headers, true, options)
  }
}

/**
 * Meta Middleware for processing incoming events.
 */
export const MetaIncomingEventMiddleware: MetaMiddleware<any, any> = { module: IncomingEventMiddleware, isClass: true }
