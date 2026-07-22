/**
 * Slash-trimming helpers.
 *
 * These replace `String#replace(/\/+$/, '')` style trims. A trailing `\/+$` regex is
 * unanchored at the start, so on a long run of slashes the engine retries from every
 * position (super-linear / quadratic backtracking, Sonar S8786). Character scanning from
 * the ends is O(n) and has no backtracking.
 */

const SLASH = 47 // '/'

/**
 * Remove every trailing `/` from a string.
 *
 * @param value - The input string.
 * @returns The string without trailing slashes.
 */
export function trimTrailingSlashes (value: string): string {
  let end = value.length
  while (end > 0 && value.charCodeAt(end - 1) === SLASH) { end-- }
  return value.slice(0, end)
}

/**
 * Remove every leading and trailing `/` from a string.
 *
 * @param value - The input string.
 * @returns The string without leading or trailing slashes.
 */
export function trimSlashes (value: string): string {
  let start = 0
  let end = value.length
  while (start < end && value.charCodeAt(start) === SLASH) { start++ }
  while (end > start && value.charCodeAt(end - 1) === SLASH) { end-- }
  return value.slice(start, end)
}
