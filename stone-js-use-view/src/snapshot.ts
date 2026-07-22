/**
 * XSS-safe serialization of SSR state snapshots.
 *
 * The server renders a JSON snapshot into an inline `<script>` tag so the client can
 * rehydrate without re-running the page loaders. Injecting `JSON.stringify(state)`
 * verbatim is a classic XSS sink: any user-controlled string containing `</script>`
 * (or a line/paragraph separator that breaks a JS string literal) escapes the tag.
 *
 * These helpers escape the characters that matter for HTML/JS context boundaries,
 * mirroring the approach used by `serialize-javascript`, `devalue` and Next.js's
 * `htmlEscapeJsonString`. The output remains valid JSON, so the client can parse it
 * with `JSON.parse` after reading `textContent`.
 */

/**
 * Default id for the snapshot `<script>` element.
 */
export const STONE_SNAPSHOT_ID = '__STONE_SNAPSHOT__'

/**
 * Map a dangerous character (by code point) to its JSON `\uXXXX` escape.
 *
 * - `<` / `>` : prevent `</script>` (and comment) sequences from closing the tag.
 * - `&`       : prevent HTML entity ambiguity.
 * - U+2028 / U+2029 : valid in JSON but terminate a JavaScript string literal.
 */
const ESCAPE_LOOKUP: Record<number, string> = {
  0x3c: String.raw`\u003C`, // <
  0x3e: String.raw`\u003E`, // >
  0x26: String.raw`\u0026`, // &
  0x2028: String.raw`\u2028`,
  0x2029: String.raw`\u2029`
}

// Matches `<`, `>`, `&`, U+2028 and U+2029 (the latter two via explicit escapes).
const ESCAPE_REGEX = /[<>&\u2028\u2029]/g

/**
 * Escape a JSON string so it is safe to embed inside an inline `<script>` element.
 *
 * The result is still valid JSON: only characters that are dangerous in the HTML/JS
 * host context are replaced by their equivalent `\uXXXX` escapes.
 *
 * @param json - A JSON string (typically from `JSON.stringify`).
 * @returns The escaped, embed-safe JSON string.
 *
 * @example
 * ```ts
 * escapeSnapshotJson('{"bio":"</script>"}')
 * // => '{"bio":"\\u003C/script\\u003E"}'
 * ```
 */
export function escapeSnapshotJson (json: string): string {
  return json.replace(ESCAPE_REGEX, (char) => ESCAPE_LOOKUP[char.codePointAt(0) ?? 0])
}

/**
 * Serialize a value to an XSS-safe, embed-ready JSON string.
 *
 * @param value - The value to serialize.
 * @returns The escaped JSON string.
 */
export function serializeSnapshot (value: unknown): string {
  return escapeSnapshotJson(JSON.stringify(value ?? {}))
}

/**
 * Render a complete snapshot `<script>` tag with the value serialized safely.
 *
 * The tag uses `type="application/json"` so the browser never executes it; the client
 * reads `element.textContent` and parses it. The `id` is escaped defensively even though
 * it is normally a constant.
 *
 * @param value - The snapshot value (already a JSON string, or any serializable value).
 * @param id - The element id (defaults to {@link STONE_SNAPSHOT_ID}).
 * @returns The `<script>` HTML string.
 */
export function renderSnapshotScript (value: unknown, id: string = STONE_SNAPSHOT_ID): string {
  const json = typeof value === 'string' ? escapeSnapshotJson(value) : serializeSnapshot(value)
  const safeId = escapeSnapshotJson(id).replaceAll('"', '&quot;')
  return `<script id="${safeId}" type="application/json">${json}</script>`
}

/**
 * Parse a snapshot JSON string previously produced by {@link serializeSnapshot} /
 * {@link renderSnapshotScript}. Escaped `\uXXXX` sequences are handled natively by
 * `JSON.parse`, so no un-escaping step is required.
 *
 * @param json - The snapshot JSON string (element `textContent`).
 * @returns The parsed value, or an empty object if the input is empty/invalid.
 */
export function parseSnapshot<T = Record<string, unknown>> (json: string | null | undefined): T {
  const empty: any = {}
  if (json === null || json === undefined || json.trim().length === 0) {
    return empty
  }
  try {
    return JSON.parse(json)
  } catch {
    return empty
  }
}
