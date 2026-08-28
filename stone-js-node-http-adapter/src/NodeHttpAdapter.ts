import {
  IncomingHttpEvent,
  OutgoingHttpResponse,
  IncomingHttpEventOptions
} from '@stone-js/http-core'
import {
  NodeHttpServer,
  ServerMiddleware,
  NodeHttpServerOptions,
  NodeHttpAdapterContext,
  NodeHttpsServerOptions,
  RawHttpResponseOptions
} from './declarations'
import {
  Adapter,
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterEventBuilder,
  defaultLoggerResolver
} from '@stone-js/core'
import chalk from 'chalk'
import connect from 'connect'
import { networkInterfaces } from 'node:os'
import { createServer as createHttpsServer } from 'node:https'
import { ServerResponseWrapper } from './ServerResponseWrapper'
import { NodeHttpAdapterError } from './errors/NodeHttpAdapterError'
import { createServer, IncomingMessage, ServerResponse } from 'node:http'

/* eslint-disable @typescript-eslint/no-misused-promises */
/**
 * Node.js HTTP Adapter for the Stone.js framework.
 *
 * The `NodeHTTPAdapter` is responsible for integrating a Node.js HTTP/HTTPS server
 * with the Stone.js framework, converting incoming HTTP requests into `IncomingHttpEvent`
 * instances, and processing outgoing responses into the `OutgoingHttpResponse` format.
 *
 * It provides lifecycle hooks for initialization, termination, and error handling,
 * ensuring seamless integration with Stone.js.
 *
 * @template RawEvent - The raw HTTP event type (e.g., `IncomingMessage`).
 * @template RawResponse - The raw HTTP response type (e.g., `ServerResponse`).
 * @template Server - The server instance type (e.g., `NodeHttpServer`).
 * @template IncomingEvent - The Stone.js incoming event type (e.g., `IncomingHttpEvent`).
 * @template IncomingEventOptions - Options for creating an incoming event.
 * @template OutgoingResponse - The outgoing response type (e.g., `OutgoingHttpResponse`).
 * @template Context - The adapter context type (e.g., `NodeHttpAdapterContext`).
 *
 * @extends Adapter
 */
/** Where the server listens when nothing says otherwise. */
const DEFAULT_URL = 'http://localhost:8080'

/** Hostnames that mean every interface. */
const WILDCARD = new Set(['0.0.0.0', '::'])

/**
 * The URL to listen on, with the platform's own instruction honoured.
 *
 * An adapter exists to translate a platform's conventions, and `PORT` is one: Cloud Run, Heroku,
 * Render, Fly, App Runner and Railway all assign a port through the environment and route traffic to
 * it. Nothing in this framework read it, so the default `http://localhost:8080` was used verbatim: an
 * application listened on a port nothing forwarded to, **on an interface nothing outside the
 * container can reach**, and answered no request at all while looking perfectly healthy in
 * development.
 *
 * A declaration wins over the environment, because an application that wrote `stone.adapter.url`
 * said what it meant. The environment is consulted only when the URL is still the default, which is
 * exactly the case where nobody has said anything.
 *
 * And when the port comes from the environment, the host becomes every interface unless `HOST` names
 * one: a platform that assigns the port is going to reach the process from outside, and loopback
 * answers nobody there. Locally, where no platform assigns anything, the default stays loopback, so
 * `stone dev` does not put a development server on the network without being asked.
 *
 * @param declared - What the blueprint says.
 * @param env - The environment to read, defaulting to this process's.
 * @returns The URL to listen on.
 */
export function resolveListenUrl (declared: string, env: Record<string, string | undefined> = process.env): URL {
  const url = new URL(declared)

  if (declared !== DEFAULT_URL) { return url }

  const host = env.HOST ?? ''
  const port = env.PORT ?? ''

  if (port !== '') {
    url.port = port
    url.hostname = host !== '' ? host : '0.0.0.0'
  } else if (host !== '') {
    url.hostname = host
  }

  return url
}

export class NodeHttpAdapter extends Adapter<
IncomingMessage,
ServerResponse,
NodeHttpServer,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse,
NodeHttpAdapterContext
> {
  protected readonly url: URL
  protected readonly logger: ILogger
  protected readonly server: NodeHttpServer
  private signalHandlersBound = false

  /**
   * Creates a new `NodeHTTPAdapter` instance.
   *
   * @param blueprint - The application blueprint.
   * @returns A new instance of `NodeHTTPAdapter`.
   *
   * @example
   * ```typescript
   * const adapter = NodeHTTPAdapter.create(blueprint);
   * await adapter.run();
   * ```
   */
  static create (blueprint: IBlueprint): NodeHttpAdapter {
    return new this(blueprint)
  }

  /**
   * Constructs a `NodeHTTPAdapter` instance.
   *
   * This constructor is protected and is intended to be used via the static `create` method.
   *
   * @param blueprint - The application blueprint for dependency resolution.
   */
  protected constructor (blueprint: IBlueprint) {
    super(blueprint)

    this.server = this.createServer()
    this.url = resolveListenUrl(blueprint.get('stone.adapter.url', DEFAULT_URL))
    this.logger = blueprint.get<LoggerResolver>('stone.logger.resolver', defaultLoggerResolver)(blueprint)
  }

  /**
   * Starts the HTTP/HTTPS server and listens for incoming requests.
   *
   * @returns A promise that resolves to an ExecutionResultType (usually `NodeHttpServer`) when the server starts successfully.
   *
   * @throws {NodeHttpAdapterError} If the server encounters an error during initialization.
   *
   * @example
   * ```typescript
   * const adapter = NodeHTTPAdapter.create(options);
   * await adapter.run();
   * console.log('Server is running');
   * ```
   */
  public async run<ExecutionResultType = NodeHttpServer>(): Promise<ExecutionResultType> {
    await this.onStart()

    return await new Promise((resolve, reject) => {
      this.server
        .once('error', (error) => reject(error))
        .listen(this.resolvePort(), this.url.hostname, () => {
          this.printUrls()
          resolve(this.server as ExecutionResultType)
        })
    })
  }

  /**
   * Lifecycle hook for adapter initialization.
   *
   * This method is called during the adapter's startup process and performs tasks
   * such as setting up exception listeners and verifying the runtime environment.
   *
   * @throws {NodeHttpAdapterError} If the adapter is used outside a Node.js context.
   */
  protected async onStart (): Promise<void> {
    if (typeof window === 'object') {
      throw new NodeHttpAdapterError(
        'This `NodeHTTPAdapter` must be used only in Node.js context.'
      )
    }

    this.setupShutdownHook()
    this.setupGlobalErrorHandlers()

    await this.executeHooks('onStart')
  }

  /**
   * Handles incoming HTTP requests and sends them through the adapter's event pipeline.
   *
   * @param rawEvent - The raw HTTP request object.
   * @param rawResponse - The raw HTTP response object.
   * @returns A promise resolving to a ServerResponse (e.g., `ServerResponse`).
   *
   * @protected
   */
  protected async eventListener (rawEvent: IncomingMessage, rawResponse: ServerResponse): Promise<ServerResponse> {
    rawEvent.on('error', (error) => {
      rawResponse.statusCode = 400
      this.logger.error(chalk.red('Error in incoming event.'), { error })
    })

    rawResponse.on('error', (error) => {
      this.logger.error(chalk.red('Error in outgoing response.'), { error })
    })

    const incomingEventBuilder = AdapterEventBuilder.create<IncomingHttpEventOptions, IncomingHttpEvent>({
      resolver: (options) => IncomingHttpEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawHttpResponseOptions, ServerResponseWrapper>({
      resolver: (options) => ServerResponseWrapper.create(rawResponse, options)
    })

    const context: NodeHttpAdapterContext = {
      rawEvent,
      rawResponse,
      rawResponseBuilder,
      incomingEventBuilder,
      executionContext: this.server
    }

    try {
      const eventHandler = this.resolveEventHandler()
      await this.executeEventHandlerHooks('onInit', eventHandler)
      return await this.sendEventThroughDestination(context, eventHandler)
    } catch (error: any) {
      const rawResponseBuilder = await this.handleError(error, context)
      return await this.buildRawResponse({ ...context, rawResponseBuilder })
    }
  }

  /**
   * Creates the HTTP or HTTPS server based on the adapter's configuration.
   *
   * @returns A `NodeHttpServer` instance.
   *
   * @protected
   */
  protected createServer (): NodeHttpServer {
    // Create a connect app to handle server middleware
    const app = connect()

    this
      .blueprint
      .get<ServerMiddleware[]>('stone.adapter.serverMiddleware', [])
      .forEach((middleware) => app.use(middleware))

    app.use(async (message, response) => await this.eventListener(message, response))

    if (this.blueprint.get('stone.adapter.isSsl') === true) {
      const options = this.blueprint.get<NodeHttpsServerOptions>('stone.adapter.server', {})
      return this.hardenServer(createHttpsServer(options, app))
    } else {
      const options = this.blueprint.get<NodeHttpServerOptions>('stone.adapter.server', {})
      return this.hardenServer(createServer(options, app))
    }
  }

  /**
   * Applies denial-of-service hardening to the HTTP(S) server.
   *
   * Sets strict defaults for header count and connection timeouts (Slowloris, socket
   * exhaustion, header floods). Every knob is overridable via `stone.adapter.server`
   * (e.g. `{ headersTimeout: 30000, maxHeadersCount: 60 }`); `maxRequestsPerSocket` is
   * only applied when explicitly configured.
   *
   * @param server - The freshly created server.
   * @returns The hardened server.
   *
   * @protected
   */
  protected hardenServer (server: NodeHttpServer): NodeHttpServer {
    const options = this.blueprint.get<Record<string, number>>('stone.adapter.server', {})

    server.maxHeadersCount = options.maxHeadersCount ?? 100 // default 2000 in Node.
    server.headersTimeout = options.headersTimeout ?? 60_000 // time to receive all headers (Slowloris).
    server.requestTimeout = options.requestTimeout ?? 300_000 // time to receive the full request.
    server.keepAliveTimeout = options.keepAliveTimeout ?? 5_000 // idle keep-alive before closing.

    if (typeof options.maxRequestsPerSocket === 'number') {
      server.maxRequestsPerSocket = options.maxRequestsPerSocket
    }

    return server
  }

  /**
   * Sets up global error handlers for uncaught exceptions and unhandled rejections.
   * Ensures critical errors are logged and the process exits safely.
   *
   * @protected
   */
  protected setupGlobalErrorHandlers (): void {
    // Bind global process listeners only once, even if run() is called again (embedded/multi-adapter
    // scenarios) — otherwise listeners stack and `process.exit` fires several times.
    if (this.signalHandlersBound) { return }
    this.signalHandlersBound = true

    process
      .on('uncaughtException', (error) => {
        this.logger.error(chalk.red('Uncaught exception detected. Shutting down the server...'), { error })
        // Process state is undefined after an uncaught exception: schedule the hard abort FIRST so
        // shutdown always completes even if the async cleanup never resolves, then best-effort clean.
        setTimeout(() => process.abort(), 1000).unref()
        void this.executeHooks('onStop').finally(() => this.server.close(() => process.exit(1)))
      })
      .on('unhandledRejection', (reason, promise) => {
        this.logger.error(chalk.red('Unhandled promise rejection detected.'), {
          promise: String(promise),
          reason: String(reason)
        })
      })
  }

  /**
   * Sets up a shutdown listener to gracefully stop the server on SIGINT/SIGTERM.
   *
   * Graceful means "let the requests in flight finish", not "wait for every socket ever opened".
   * `close()` alone means the latter: a keep-alive connection sitting idle has no request to finish,
   * yet it holds the callback, so `process.exit(0)` never runs. A signalled process then never dies.
   * Whatever sent the signal waits for its own timeout and hard-kills, which is how a rolling deploy
   * turns a graceful shutdown into a killed one and an `onStop` hook becomes a lie.
   *
   * So idle connections are closed immediately, requests in flight get the grace period, and the
   * process exits either way.
   */
  protected setupShutdownHook (): void {
    // Idempotent alongside setupGlobalErrorHandlers (both bind once; see the shared guard flag).
    if (this.signalHandlersBound) { return }

    const shutdown = async (): Promise<void> => {
      await this.executeHooks('onStop')

      this.server.close(() => process.exit(0))
      this.server.closeIdleConnections?.()

      setTimeout(() => {
        this.server.closeAllConnections?.()
        process.exit(0)
      }, this.blueprint.get('stone.adapter.shutdownGracePeriod', 10000)).unref()
    }

    process
      .on('SIGINT', shutdown)
      .on('SIGTERM', shutdown)
  }

  /**
   * Resolve the listen port: the explicit URL port, else the protocol default (443/80) rather
   * than binding a random port when the configured URL omits the port.
   *
   * @returns The port to listen on.
   */
  private resolvePort (): number {
    if (this.url.port !== '') { return Number(this.url.port) }
    return this.url.protocol === 'https:' ? 443 : 80
  }

  /**
   * Prints the server URLs to the console.
   */
  private printUrls (): void {
    if (this.blueprint.get('stone.adapter.printUrls') !== true) { return }

    // Only what actually answers. Bound to loopback, the banner used to advertise the machine's LAN
    // address, which returns nothing: it sent whoever tried it looking for a firewall that was not
    // there. The line appears when the server is bound to every interface, and then it is true.
    const onEveryInterface = WILDCARD.has(this.url.hostname)
    const localUrl = onEveryInterface ? `http://localhost:${this.resolvePort()}/` : this.url.href
    const networkUrl = onEveryInterface ? this.getNetworkUrl() : undefined

    this.logger.info(`
  ${chalk.green('➜')}  ${chalk.white('Local:')}    ${chalk.blue(localUrl)}${
    networkUrl === undefined
      ? ''
      : `\n  ${chalk.green('➜')}  ${chalk.gray('Network:')}  ${chalk.blue(networkUrl)}`
  }
  ${chalk.green('➜')}  ${chalk.gray('Press CTRL+C to stop')}
      `)
  }

  /**
   * The address this machine can be reached at from the network, when there is one.
   *
   * Built from the interface rather than by substituting into the configured URL: bound to every
   * interface the hostname is `0.0.0.0`, and a textual replacement of `localhost` found nothing to
   * replace, so the line printed the wildcard address as if it were reachable.
   *
   * @returns The network URL, or nothing when no external interface exists.
   */
  private getNetworkUrl (): string | undefined {
    const interfaces = networkInterfaces()

    for (const key of Object.keys(interfaces)) {
      for (const net of interfaces[key] ?? []) {
        if (net.family === 'IPv4' && !net.internal) {
          return `${this.url.protocol}//${net.address}:${this.resolvePort()}/`
        }
      }
    }
  }
}
