import { Encoding } from 'node:crypto'
import { CookieOptions } from '../declarations'
import { HttpErrorHandler } from '../HttpErrorHandler'
import { IncomingHttpEvent } from '../IncomingHttpEvent'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { OutgoingHttpResponse } from '../OutgoingHttpResponse'

export interface HttpCorsConfig {
  /**
   * The allowed origins for CORS requests.
   */
  origin: string | string[]
  /**
   * The allowed methods for CORS requests.
   */
  methods: string | string[]
  /**
   * The maximum age for preflight requests.
   */
  maxAge: number | null
  /**
   * Whether credentials are allowed in CORS requests.
   */
  credentials: boolean
  /**
   * The headers that are exposed to the client in CORS responses.
   */
  exposedHeaders: string | string[]
  /**
   * The headers that are allowed in CORS requests.
   */
  allowedHeaders: string | string[]
  /**
   * The HTTP status code to use for successful preflight requests.
   */
  successStatus: number
  /**
   * Whether to stop processing preflight requests.
   */
  preflightStop: boolean
};

export interface HttpJsonConfig {
  /**
   * The number of spaces to use for formatting JSON output.
   */
  spaces: string
  /**
   * Whether to escape HTML characters in JSON output.
   */
  escape: boolean
  /**
   * A custom replacer function for JSON serialization.
   */
  replacer?: (this: unknown, key: string, value: unknown) => unknown
}

/**
 * Represents the core HTTP config options for the application.
 * HTTP configuration options that are commonly used across adapters.
 */
export interface HttpConfig {
  /**
   * Host-related configuration options.
   */
  hosts: {
    /**
     * A list of trusted hostnames.
     */
    trusted: string[]
    /**
     * A list of trusted host patterns.
     */
    trustedPattern: string[]
    /**
     * Whether only subdomains are allowed.
     */
    onlySubdomain: boolean
  }
  /**
   * Proxy-related configuration options.
   */
  proxies: {
    /**
     * A list of trusted proxies.
     */
    trustedIp: string[]
    /**
     * A list of untrusted proxies.
     */
    untrustedIp: string[]
  }
  /**
   * Request limits — defence-in-depth against denial-of-service via oversized requests.
   * Applied by `RequestLimitsMiddleware` (and effective across every adapter, incl. serverless
   * where the Node server knobs are unavailable). Set a value to `0` to disable that check.
   */
  limits: {
    /** Maximum number of distinct request headers accepted (0 = unlimited). Default 100. */
    maxHeaders: number
    /** Maximum number of cookies accepted in the request (0 = unlimited). Default 50. */
    maxCookies: number
  }
  /**
   * Configuration for request body parsing.
   */
  body: {
    /**
     * The maximum size of the request body.
     */
    limit: string
    /**
     * The content type of the request body.
     */
    defaultType: string
    /**
     * The default character set for the request body.
     */
    defaultCharset: string
  }
  /**
   * Cache configuration options.
   */
  cache: Record<string, any>
  /**
   * Cookie-related configuration options.
   */
  cookie: {
    /**
     * The secret used for signing cookies. Undefined by default: cookies are NOT signed unless a
     * strong secret (>= 32 chars) is configured. A weak/empty secret is rejected rather than
     * silently producing a forgeable signature.
     */
    secret?: string
    /**
     * Additional cookie options.
     */
    options: CookieOptions
  }
  /**
   * JSON-related configuration options.
   */
  json: HttpJsonConfig
  /**
   * File upload and response configuration options.
   */
  files: {
    /**
     * Configuration for file uploads.
     */
    upload: Record<string, any>
    /**
     * Configuration for file responses.
     */
    download: Record<string, any>
    /**
     * The root directory for serving static files.
     */
    rootDir?: string
    /**
     * The list of accepted file extensions.
     */
    extensions?: string[]
    /**
     * The default encoding for compressed static files.
     */
    defaultCompressionEncoding: Record<string, string>
  }
  /**
   * JSONP-related configuration options.
   */
  jsonp: {
    /**
     * Configuration for the JSONP callback function.
     */
    callback: {
      /**
       * The name of the JSONP callback parameter.
       */
      name: string
    }
  }
  /**
   * Subdomain-related configuration options.
   */
  subdomain: {
    /**
     * The offset to use when determining subdomains.
     */
    offset: number
  }
  /**
   * ETag-related configuration options.
   */
  etag: {
    /**
     * A custom function for generating ETags.
     */
    function?: (content: string, encoding: Encoding) => string
  }
  /**
   * Cross-Origin Resource Sharing (CORS) configuration options.
   */
  cors: HttpCorsConfig
}

/**
 * Represents the core HTTP configuration options for the application.
 */
export interface HttpCoreConfig extends Partial<AppConfig<IncomingHttpEvent, OutgoingHttpResponse>> {
  http: Partial<HttpConfig>
}

/**
 * Represents the core HTTP blueprint for the application.
 */
export interface HttpCoreBlueprint extends StoneBlueprint<IncomingHttpEvent, OutgoingHttpResponse> {
  stone: HttpCoreConfig
}

/**
 * Default HTTP configuration options for the application.
 */
export const httpCoreBlueprint: HttpCoreBlueprint = {
  stone: {
    kernel: {
      errorHandlers: {
        default: { module: HttpErrorHandler, isClass: true }
      }
    },
    http: {
      hosts: {
        trusted: [],
        trustedPattern: [],
        onlySubdomain: true
      },
      proxies: {
        trustedIp: [],
        untrustedIp: []
      },
      limits: {
        maxHeaders: 100,
        maxCookies: 50
      },
      body: {
        limit: '100kb',
        defaultCharset: 'utf-8',
        defaultType: 'text/plain'
      },
      cache: {},
      cookie: {
        // No secret by default → cookies are not signed (rather than signed with a forgeable
        // empty key). Set a strong secret (>= 32 chars) to enable signing.
        secret: undefined,
        options: {}
      },
      json: {
        spaces: '',
        escape: true,
        replacer: undefined
      },
      files: {
        upload: {},
        download: {},
        defaultCompressionEncoding: {
          '.br': 'br',
          '.brotli': 'br',
          '.gzip': 'gzip',
          '.gz': 'gzip'
        }
      },
      jsonp: {
        callback: {
          name: 'callback'
        }
      },
      subdomain: {
        offset: 1
      },
      etag: {
        function: undefined
      },
      cors: {
        origin: [],
        methods: [],
        maxAge: 86400,
        credentials: false,
        exposedHeaders: [],
        allowedHeaders: [],
        successStatus: 204,
        preflightStop: false
      }
    }
  }
}
