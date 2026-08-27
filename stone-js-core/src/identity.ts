import { isPlainObject } from '@stone-js/config'

/**
 * Identity helpers: how a value becomes a stable key.
 *
 * A leaf module on purpose. `IncomingEvent` needs these to compute its fingerprint, and `utils.ts`
 * already imports `IncomingEvent`, so putting them there would close a cycle between the two.
 */
/**
 * Base64-encode a string, wherever the code is running.
 *
 * Node and a browser disagree on how to do this, and the browser's `btoa` only accepts latin1, so a
 * non-latin path or a payload with an accent throws. Encoding to UTF-8 bytes first makes both agree
 * on the same output, which matters because the two halves of a hydrated render can happen on
 * different sides of that divide and have to produce the same key.
 *
 * @param value - The string to encode.
 * @returns The base64 form.
 */
export const toBase64 = (value: string): string => {
  /* v8 ignore next 3 */ // The btoa branch cannot run under the Node test runtime.
  return typeof Buffer !== 'undefined'
    ? Buffer.from(value, 'utf-8').toString('base64')
    : btoa(String.fromCodePoint(...new TextEncoder().encode(value)))
}

/**
 * Serialize a value so that equal values always produce equal strings.
 *
 * `JSON.stringify` preserves insertion order, so two objects holding the same entries serialize
 * differently and would look like two different things. Object keys are sorted here, at every depth,
 * which is what makes the result usable as an identity.
 *
 * Arrays keep their order, because in an array order is meaning.
 *
 * @param value - The value to serialize.
 * @returns The stable serialization.
 */
export const stableStringify = (value: unknown): string => {
  return JSON.stringify(value, (_key, item) => {
    if (isPlainObject(item)) {
      // Compared by code unit, deliberately, and not through `localeCompare`: a locale-aware order
      // is not the same order on two machines, and the two halves of a hydrated render can run on
      // two machines. A key has to be stable before it is pretty.
      const byCodeUnit = (a: string, b: string): number => {
        if (a < b) { return -1 }
        return a > b ? 1 : 0
      }

      return Object.keys(item).sort(byCodeUnit).reduce<Record<string, unknown>>((sorted, key) => {
        sorted[key] = (item as Record<string, unknown>)[key]
        return sorted
      }, {})
    }

    return item
  }) ?? ''
}

/**
 * The identity of an event that carries a URL.
 *
 * One function, so that two platforms cannot disagree about it. They did: an HTTP event keyed on the
 * pathname alone while a browser event keyed on the pathname *and* the query string, so a server
 * render of `/tasks?page=2` stored its data under `GET|/tasks` and the browser hydrating the same
 * page looked for `GET|/tasks?page=2` and found nothing. The page then refetched, silently, on every
 * URL that carried a query.
 *
 * The query is part of the identity, because `/tasks?page=2` and `/tasks?page=3` are two pages with
 * two sets of data. The origin is not: the same route served from two hosts is the same route.
 *
 * @param method - The method the event arrived with.
 * @param url - The URL the event arrived at.
 * @param extra - Anything else that narrows the identity, such as a client's own details.
 * @returns The fingerprint, base64-encoded.
 */
export const urlFingerprint = (method: string, url: URL, extra: string[] = []): string => {
  return toBase64([method, `${url.pathname}${url.search}`, ...extra].join('|'))
}
