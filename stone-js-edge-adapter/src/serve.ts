import { buildFetchHandler } from './buildFetchHandler'
import { EdgeAppOptions, FetchHandler } from './declarations'

/**
 * Returns a Web-standard fetch handler that boots the app lazily on the first request (so it works
 * as a module export). This is the generic target — Vercel Edge and any WinterCG host use it as-is.
 *
 * @param options - The app to boot.
 * @returns A fetch handler.
 */
export function serveFetch (options: EdgeAppOptions = {}): FetchHandler {
  let handler: Promise<FetchHandler> | undefined
  return async (request: Request, executionContext?: Record<string, unknown>): Promise<Response> => {
    handler = handler ?? buildFetchHandler(options)
    return await (await handler)(request, executionContext)
  }
}

/**
 * Cloudflare Workers entry: `export default serveCloudflare({ modules: [App] })`.
 * The Worker's `env`/`ctx` are forwarded to the handler's execution context.
 *
 * @param options - The app to boot.
 * @returns A Cloudflare module worker with a `fetch` method.
 */
export function serveCloudflare (options: EdgeAppOptions = {}): { fetch: (request: Request, env?: unknown, ctx?: unknown) => Promise<Response> } {
  const handler = serveFetch(options)
  return {
    fetch: async (request: Request, env?: unknown, ctx?: unknown) => await handler(request, { env, ctx })
  }
}

/**
 * Vercel Edge Function entry: `export default serveVercel({ modules: [App] })`
 * (add `export const config = { runtime: 'edge' }`).
 *
 * @param options - The app to boot.
 * @returns A fetch handler.
 */
export function serveVercel (options: EdgeAppOptions = {}): FetchHandler {
  return serveFetch(options)
}

/**
 * Netlify Edge Function entry: `export default serveNetlify({ modules: [App] })`.
 * Netlify's context is forwarded to the handler's execution context.
 *
 * @param options - The app to boot.
 * @returns A Netlify edge handler.
 */
export function serveNetlify (options: EdgeAppOptions = {}): (request: Request, context?: unknown) => Promise<Response> {
  const handler = serveFetch(options)
  return async (request: Request, context?: unknown) => await handler(request, { context })
}

/**
 * Bun entry: `export default serveBun({ modules: [App] })` — a `Bun.serve` compatible object.
 *
 * @param options - The app to boot.
 * @param serveOptions - Extra `Bun.serve` options (e.g. `port`).
 * @returns A Bun server object with a `fetch` method.
 */
export function serveBun (options: EdgeAppOptions = {}, serveOptions: Record<string, unknown> = {}): Record<string, unknown> {
  const handler = serveFetch(options)
  return { ...serveOptions, fetch: async (request: Request) => await handler(request) }
}

/**
 * Deno entry: `serveDeno({ modules: [App] })` — starts `Deno.serve` immediately.
 *
 * @param options - The app to boot.
 * @param serveOptions - Extra `Deno.serve` options (e.g. `{ port }`).
 * @returns Whatever `Deno.serve` returns (the server).
 * @throws {Error} When not running on Deno.
 */
export function serveDeno (options: EdgeAppOptions = {}, serveOptions: Record<string, unknown> = {}): unknown {
  const deno = (globalThis as Record<string, any>).Deno
  if (deno?.serve === undefined) {
    throw new Error('serveDeno must run on the Deno runtime (`Deno.serve` was not found).')
  }
  const handler = serveFetch(options)
  return deno.serve(serveOptions, async (request: Request) => await handler(request))
}
