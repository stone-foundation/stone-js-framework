/**
 * Platform identifier for the Web-standard (Fetch) adapter.
 *
 * Used to key the adapter in the blueprint and to tag the event source, so the rest of the
 * framework can recognise a Fetch-driven request regardless of the concrete runtime (Cloudflare
 * Workers, Deno, Bun, Vercel/Netlify Edge, or any WinterCG-compatible host).
 */
export const FETCH_PLATFORM = 'fetch'

/**
 * The headers an edge runtime writes the client address into, most trusted first.
 *
 * Cloudflare first, because `cf-connecting-ip` is the one its own edge overwrites and therefore the
 * one a caller cannot forge. The order is this platform's to know, which is why it is passed to the
 * shared normaliser rather than baked into it.
 */
export const IP_HEADERS: readonly string[] = ['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for']
