import { ApiGatewayWsAdapterError } from '../errors/ApiGatewayWsAdapterError'
import { Connection, ConnectionStore, PresenceMember } from '@stone-js/realtime'
import { DynamoDocumentClient, DynamoStoreOptions } from '../declarations'

const META = 'META'
const CONN = 'CONN#'
const CHAN = 'CHAN#'

/**
 * A DynamoDB-backed {@link ConnectionStore} for API Gateway WebSocket presence.
 *
 * API Gateway invokes a fresh Lambda per event, so presence cannot live in memory: this store keeps
 * connections and their channel memberships in a single table, shared across invocations. Items use
 * a `pk`/`sk` layout: a connection meta record (`CONN#<id>` / `META`) and two-way membership records
 * (`CHAN#<channel>` / `CONN#<id>` and `CONN#<id>` / `CHAN#<channel>`) so both "who is on a channel"
 * and "clean up a connection" are single queries. `@aws-sdk/lib-dynamodb` is imported lazily.
 */
export class DynamoDbConnectionStore implements ConnectionStore {
  private readonly table: string
  private readonly options: DynamoStoreOptions
  private clientPromise?: Promise<DynamoDocumentClient>

  /**
   * Create a DynamoDB connection store.
   *
   * @param options - The store options.
   * @returns A new store.
   */
  static create (options: DynamoStoreOptions = {}): DynamoDbConnectionStore {
    return new this(options)
  }

  /**
   * @param options - The store options.
   */
  constructor (options: DynamoStoreOptions = {}) {
    this.options = options
    this.table = options.table ?? 'stone_ws_connections'
  }

  /** @inheritdoc */
  async add (connection: Connection): Promise<void> {
    const client = await this.client()
    await client.put({ TableName: this.table, Item: { pk: `${CONN}${connection.id}`, sk: META, info: connection.info } })
  }

  /** @inheritdoc */
  async remove (connectionId: string): Promise<void> {
    const client = await this.client()
    const { Items = [] } = await client.query({
      TableName: this.table,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': `${CONN}${connectionId}` }
    })

    for (const item of Items) {
      const sk = String(item.sk)
      if (sk.startsWith(CHAN)) {
        const channel = sk.slice(CHAN.length)
        await client.delete({ TableName: this.table, Key: { pk: `${CHAN}${channel}`, sk: `${CONN}${connectionId}` } })
      }
      await client.delete({ TableName: this.table, Key: { pk: `${CONN}${connectionId}`, sk } })
    }
  }

  /** @inheritdoc */
  async subscribe (connectionId: string, channel: string): Promise<void> {
    const client = await this.client()
    await client.put({ TableName: this.table, Item: { pk: `${CHAN}${channel}`, sk: `${CONN}${connectionId}` } })
    await client.put({ TableName: this.table, Item: { pk: `${CONN}${connectionId}`, sk: `${CHAN}${channel}` } })
  }

  /** @inheritdoc */
  async unsubscribe (connectionId: string, channel: string): Promise<void> {
    const client = await this.client()
    await client.delete({ TableName: this.table, Key: { pk: `${CHAN}${channel}`, sk: `${CONN}${connectionId}` } })
    await client.delete({ TableName: this.table, Key: { pk: `${CONN}${connectionId}`, sk: `${CHAN}${channel}` } })
  }

  /** @inheritdoc */
  async connectionsFor (channel: string): Promise<Connection[]> {
    const client = await this.client()
    const { Items = [] } = await client.query({
      TableName: this.table,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': `${CHAN}${channel}` }
    })
    return Items.map((item) => ({ id: String(item.sk).slice(CONN.length) }))
  }

  /** @inheritdoc */
  async members (channel: string): Promise<PresenceMember[]> {
    return (await this.connectionsFor(channel)).map((connection) => ({ connectionId: connection.id }))
  }

  /**
   * Lazily build (and memoize) the DynamoDB document client.
   *
   * @returns The document client.
   * @throws {ApiGatewayWsAdapterError} When the AWS SDK is not installed.
   */
  private async client (): Promise<DynamoDocumentClient> {
    if (this.options.client !== undefined) { return this.options.client }
    this.clientPromise = this.clientPromise ?? this.build()
    return await this.clientPromise
  }

  /**
   * Build the DynamoDB document client from the AWS SDK.
   *
   * @returns The document client.
   * @throws {ApiGatewayWsAdapterError} When the AWS SDK is not installed.
   */
  private async build (): Promise<DynamoDocumentClient> {
    const [{ DynamoDBClient }, { DynamoDBDocument }] = await Promise.all([
      import('@aws-sdk/client-dynamodb'),
      import('@aws-sdk/lib-dynamodb')
    ]).catch(() => {
      throw new ApiGatewayWsAdapterError('The DynamoDB connection store requires "@aws-sdk/client-dynamodb" and "@aws-sdk/lib-dynamodb". Install them: npm i @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb')
    })

    const base = new DynamoDBClient(this.options.region !== undefined ? { region: this.options.region } : {})
    return DynamoDBDocument.from(base) as unknown as DynamoDocumentClient
  }
}
