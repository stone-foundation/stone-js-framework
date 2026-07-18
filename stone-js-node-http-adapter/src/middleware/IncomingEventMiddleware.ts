import {
  getProtocol,
  isIpTrusted,
  getHostname,
  CookieSameSite,
  CookieCollection
} from '@stone-js/http-core'
import proxyAddr from 'proxy-addr'
import { TLSSocket } from 'node:tls'
import { IncomingMessage } from 'node:http'
import { NODE_HTTP_PLATFORM } from '../constants'
import { IBlueprint, NextMiddleware } from '@stone-js/core'
import { NodeHttpAdapterError } from '../errors/NodeHttpAdapterError'
import { NodeHttpAdapterContext, NodeHttpAdapterResponseBuilder } from '../declarations'

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
 * This class processes incoming HTTP requests, extracting relevant data such as URL, IP addresses,
 * headers, cookies, and more, and forwards them to the next middleware in the pipeline.
 */
export class IncomingEventMiddleware {
  /**
   * The blueprint for resolving configuration and dependencies.
   */
  private readonly blueprint: IBlueprint

  /**
   * Create an IncomingEventMiddleware instance.
   *
   * @param {blueprint} options - Options containing the blueprint for resolving configuration and dependencies.
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
   * @throws {NodeHttpAdapterError} If required components are missing in the context.
   */
  async handle (context: NodeHttpAdapterContext, next: NextMiddleware<NodeHttpAdapterContext, NodeHttpAdapterResponseBuilder>): Promise<NodeHttpAdapterResponseBuilder> {
    if ((context.rawEvent == null) || ((context.incomingEventBuilder?.add) == null)) {
      throw new NodeHttpAdapterError('The context is missing required components.')
    }

    const proxyOptions = this.getProxyOptions()
    const cookieOptions = this.getCookieOptions()
    const url = this.extractUrl(context.rawEvent, proxyOptions)
    const ipAddresses = this.extractIpAddresses(context.rawEvent, proxyOptions)

    context
      .incomingEventBuilder
      .add('url', url)
      .add('ips', ipAddresses)
      .add('queryString', url.search)
      .add('source', this.getSource(context))
      .add('headers', context.rawEvent.headers)
      // If not defined by other middleware
      // In fullstack forms, the method is spoofed and sent as a hidden field
      .addIf('method', context.rawEvent.method)
      .add('protocol', this.getProtocol(context.rawEvent, proxyOptions))
      .add('ip', proxyAddr(context.rawEvent, isIpTrusted(proxyOptions.trustedIp, proxyOptions.untrustedIp)))
      .add('cookies', CookieCollection.create(context.rawEvent.headers.cookie, cookieOptions, this.getCookieSecret()))

    return await next(context)
  }

  /**
   * Create the IncomingEventSource from the context.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @returns The Incoming Event Source.
   */
  private getSource (context: NodeHttpAdapterContext): unknown {
    return {
      rawEvent: context.rawEvent,
      platform: NODE_HTTP_PLATFORM,
      rawResponse: context.rawResponse,
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
    const proxyOptions = this.blueprint.get<HttpProxyOptions>('stone.http.proxies', defaultProxyOptions)
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
   * Extracts and parses the URL from the incoming message.
   *
   * @param message - The incoming HTTP message.
   * @param options - Proxy options.
   * @returns The parsed URL object.
   */
  private extractUrl (message: IncomingMessage, options: HttpProxyOptions): URL {
    const hostname = getHostname(message.socket.remoteAddress ?? '', message.headers, options)
    const proto = getProtocol(message.socket.remoteAddress ?? '', message.headers, message.socket instanceof TLSSocket, options)
    return new URL(message.url ?? '', `${String(proto)}://${String(hostname)}`)
  }

  /**
   * Extracts a list of IP addresses from the incoming message.
   *
   * @param message - The incoming HTTP message.
   * @param options - Proxy options.
   * @returns An array of IP addresses.
   */
  private extractIpAddresses (message: IncomingMessage, options: HttpProxyOptions): string[] {
    const isTrusted = isIpTrusted(options.trustedIp, options.untrustedIp)
    return proxyAddr.all(message, isTrusted).slice(1).reverse()
  }

  /**
   * Determines the protocol from the incoming message.
   *
   * @param message - The incoming message.
   * @param options - Proxy options.
   * @returns The protocol string.
   */
  private getProtocol (message: IncomingMessage, options: HttpProxyOptions): string {
    return getProtocol(message.socket.remoteAddress ?? '', message.headers, message.socket instanceof TLSSocket, options)
  }
}

/**
 * Meta Middleware for processing incoming events.
 */
export const MetaIncomingEventMiddleware = { module: IncomingEventMiddleware, isClass: true }
