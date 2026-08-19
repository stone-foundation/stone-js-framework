import { IncomingEvent, OutgoingResponse } from '@stone-js/core'

/**
 * An outgoing response with the readers a test always needs.
 *
 * `content` is the wire payload: a JSON string for an API, an HTML string for a rendered page. Every
 * project ends up writing the same `JSON.parse(response.content)` helper; these are that helper, once,
 * for both kinds of application.
 */
export type TestResponse<ResponseType extends OutgoingResponse = OutgoingResponse> = ResponseType & {
  /** The body as data: parsed when it is a JSON string, returned as-is when it is already a value. */
  json: <T = unknown>() => T

  /**
   * The body as text.
   *
   * This is what a frontend app answers with: a rendered page is an HTML string, so an integration
   * test asserts on it directly. For querying that HTML rather than matching it, parse it with
   * whatever you already use (`happy-dom`, `jsdom`, Testing Library) — there is no assertion library
   * here, on purpose.
   */
  text: () => string

  /** The body as text. An alias for {@link text}, for when the body is a rendered page. */
  html: () => string
}

/**
 * Attach the body readers to a response.
 *
 * Defined on the instance rather than wrapped in a proxy so the response a test receives *is* the
 * response the handlers produced: same identity, same prototype, `instanceof` and every property
 * untouched. Non-enumerable, so it stays out of snapshots and `toEqual` comparisons.
 *
 * @param response - The response the kernel produced.
 * @returns The same response, with `json()`, `text()` and `html()`.
 */
function withReaders<ResponseType extends OutgoingResponse> (response: ResponseType): TestResponse<ResponseType> {
  // An app that produced nothing is a failing assertion, not a crash in the harness: attaching to a
  // non-object would throw here and bury the real reason under a `defineProperty` error.
  if (typeof response !== 'object' || response === null) { return response as TestResponse<ResponseType> }

  const text = (): string => {
    const content = response.content
    return typeof content === 'string' ? content : JSON.stringify(content)
  }

  const readers = {
    json: <T = unknown>(): T => {
      const content = response.content
      // A handler that returned an object gets it back unparsed: `json()` answers "the body as
      // data", which is the question a test is asking either way.
      return typeof content === 'string' ? JSON.parse(content) : content as T
    },
    text,
    html: text
  }

  for (const [name, value] of Object.entries(readers)) {
    Object.defineProperty(response, name, { configurable: true, enumerable: false, value })
  }

  return response as TestResponse<ResponseType>
}

/**
 * A booted, in-memory Stone.js app you can send synthetic events to.
 *
 * `send` dispatches an event through the real kernel (middleware, handler, response, error
 * handling) — exactly what production runs, minus the network. Each call gets a fresh ephemeral
 * container, mirroring the per-request isolation of Stone.js.
 */
export class TestClient {
  /**
   * @param dispatch - The bound dispatch function from the test adapter.
   */
  constructor (private readonly dispatch: (event: IncomingEvent) => Promise<OutgoingResponse>) {}

  /**
   * Dispatch an event and resolve with the outgoing response.
   *
   * @param event - The incoming event (build one with the factories).
   * @returns The outgoing response, with `json()` for reading the body as data.
   */
  async send<ResponseType extends OutgoingResponse = OutgoingResponse> (
    event: IncomingEvent
  ): Promise<TestResponse<ResponseType>> {
    return withReaders(await this.dispatch(event) as ResponseType)
  }
}
