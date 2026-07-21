import { EventBusError } from '../errors/EventBusError'
import { EmitOptions, EventBusConnection, EventBridgeOptions } from '../declarations'

/**
 * AWS EventBridge bus connection.
 *
 * Publishes each event as a `PutEvents` entry (`Source`, `DetailType`, `Detail`) on the configured
 * event bus. The domain emits; EventBridge rules fan out to targets (Lambda, SQS, ...), where the
 * listener side ({@link BusEventHandler}) routes the event to its `@OnBusEvent` handler.
 * `@aws-sdk/client-eventbridge` is imported lazily as an optional peer dependency.
 */
export class EventBridgeEventBus implements EventBusConnection {
  readonly name: string

  private readonly source: string
  private readonly busName: string
  private readonly options: EventBridgeOptions
  private clientPromise?: Promise<any>

  /**
   * Create an EventBridge connection.
   *
   * @param options - The connection options.
   * @returns A new connection.
   */
  static create (options: EventBridgeOptions): EventBridgeEventBus {
    return new this(options)
  }

  /**
   * @param options - The connection options.
   */
  constructor (options: EventBridgeOptions) {
    this.options = options
    this.name = options.name ?? 'eventbridge'
    this.source = options.source ?? 'stone.app'
    this.busName = options.busName ?? 'default'
  }

  /** @inheritdoc */
  async emit <T = unknown>(name: string, payload?: T, options: EmitOptions = {}): Promise<void> {
    const { client, PutEventsCommand } = await this.resolve()
    await client.send(new PutEventsCommand({
      Entries: [{
        Source: options.source ?? this.source,
        DetailType: options.detailType ?? name,
        Detail: JSON.stringify(payload ?? {}),
        EventBusName: this.busName
      }]
    }))
  }

  /**
   * Lazily build (and memoize) the client and command.
   *
   * @returns The client and the `PutEventsCommand` constructor.
   * @throws {EventBusError} When the AWS SDK is not installed.
   */
  private async resolve (): Promise<{ client: any, PutEventsCommand: any }> {
    this.clientPromise = this.clientPromise ?? import('@aws-sdk/client-eventbridge').catch(() => {
      throw new EventBusError('The EventBridge driver requires "@aws-sdk/client-eventbridge". Install it: npm i @aws-sdk/client-eventbridge')
    })

    const { EventBridgeClient, PutEventsCommand } = await this.clientPromise
    const client = this.options.client ?? new EventBridgeClient(this.options.region !== undefined ? { region: this.options.region } : {})
    return { client, PutEventsCommand }
  }
}
