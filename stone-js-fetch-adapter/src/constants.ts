/**
 * Platform identifier for the Web-standard (Fetch) adapter.
 *
 * Used to key the adapter in the blueprint and to tag the event source, so the rest of the
 * framework can recognise a Fetch-driven request regardless of the concrete runtime (Cloudflare
 * Workers, Deno, Bun, Vercel/Netlify Edge, or any WinterCG-compatible host).
 */
export const FETCH_PLATFORM = 'fetch'
