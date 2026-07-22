import { IncomingHttpEvent } from './IncomingHttpEvent'
import { IBlueprint, IContainer } from '@stone-js/core'
import { OutgoingHttpResponse } from './OutgoingHttpResponse'

/**
 * Class representing a JsonResponse.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class JsonResponse extends OutgoingHttpResponse {
  static OUTGOING_HTTP_RESPONSE = 'stonejs@outgoing_http_json_response'
  /**
   * Prepare the response before sending.
   *
   * @param event - The incoming HTTP event.
   * @param container - The service container.
   * @returns The current instance of the response for chaining.
   */
  prepare (event: IncomingHttpEvent, container?: IContainer): this | Promise<this> {
    return this
      .setBlueprintResolver(() => container?.make<IBlueprint>('blueprint'))
      .setIncomingEventResolver(() => event)
      .setContentType('json')
      .prepareCookies()
      .makeJson()
      .setPrepared(true)
  }

  /**
   * Make JSON response.
   *
   * @returns The current instance for method chaining.
   */
  protected makeJson (): this {
    if (typeof this.content !== 'string') {
      this.setContent(this.content)
    }

    return this
  }
}
