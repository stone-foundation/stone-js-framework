import { ManagementClient, ManagementClientOptions } from './declarations'
import { ApiGatewayWsAdapterError } from './errors/ApiGatewayWsAdapterError'

/**
 * Posts messages back to WebSocket connections through the API Gateway Management API.
 *
 * In an API Gateway WebSocket API there is no held socket: to push to a client you call
 * `postToConnection` against the management endpoint (`https://<domain>/<stage>`). A stale
 * connection (410 Gone) is swallowed, since it just means the client has since disconnected.
 * `@aws-sdk/client-apigatewaymanagementapi` is imported lazily as an optional peer dependency.
 */
export class ApiGatewayManagementClient implements ManagementClient {
  private readonly endpoint: string
  private clientPromise?: Promise<any>
  private readonly providedClient?: unknown

  /**
   * Create a management client.
   *
   * @param options - The client options.
   * @returns A new client.
   */
  static create (options: ManagementClientOptions): ApiGatewayManagementClient {
    return new this(options)
  }

  /**
   * @param options - The client options.
   */
  constructor (options: ManagementClientOptions) {
    this.endpoint = options.endpoint
    this.providedClient = options.client
  }

  /** @inheritdoc */
  async postToConnection (connectionId: string, data: string): Promise<void> {
    const { client, PostToConnectionCommand } = await this.resolve()
    try {
      await client.send(new PostToConnectionCommand({ ConnectionId: connectionId, Data: data }))
    } catch (error: any) {
      if (this.isGone(error)) { return }
      throw error
    }
  }

  /**
   * Whether an error means the connection is gone (410) and should be ignored.
   *
   * @param error - The thrown error.
   * @returns True when the connection is stale.
   */
  private isGone (error: any): boolean {
    return error?.name === 'GoneException' || error?.$metadata?.httpStatusCode === 410 || error?.statusCode === 410
  }

  /**
   * Lazily build (and memoize) the underlying client and command.
   *
   * @returns The client and the `PostToConnectionCommand` constructor.
   * @throws {ApiGatewayWsAdapterError} When the AWS SDK is not installed.
   */
  private async resolve (): Promise<{ client: any, PostToConnectionCommand: any }> {
    this.clientPromise = this.clientPromise ?? import('@aws-sdk/client-apigatewaymanagementapi')
      .catch(() => {
        throw new ApiGatewayWsAdapterError('The API Gateway WebSocket adapter requires "@aws-sdk/client-apigatewaymanagementapi". Install it: npm i @aws-sdk/client-apigatewaymanagementapi')
      })

    const { ApiGatewayManagementApiClient, PostToConnectionCommand } = await this.clientPromise
    const client = this.providedClient ?? new ApiGatewayManagementApiClient({ endpoint: this.endpoint })
    return { client, PostToConnectionCommand }
  }
}
