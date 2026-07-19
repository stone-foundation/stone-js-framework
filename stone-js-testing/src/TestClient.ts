import { IncomingEvent, OutgoingResponse } from '@stone-js/core'

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
   * @returns The outgoing response.
   */
  async send<ResponseType extends OutgoingResponse = OutgoingResponse> (event: IncomingEvent): Promise<ResponseType> {
    return await this.dispatch(event) as ResponseType
  }
}
