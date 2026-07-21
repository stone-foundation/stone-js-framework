import { DynamoDbConnectionStore } from '../../src/drivers/DynamoDbConnectionStore'

const fakeClient = (): any => ({
  put: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue({}),
  query: vi.fn().mockResolvedValue({ Items: [] })
})

const T = 'stone_ws_connections'

describe('DynamoDbConnectionStore', () => {
  it('add stores a connection meta record', async () => {
    const client = fakeClient()
    await DynamoDbConnectionStore.create({ client }).add({ id: 'a', info: { user: 'Ana' } })
    expect(client.put).toHaveBeenCalledWith({ TableName: T, Item: { pk: 'CONN#a', sk: 'META', info: { user: 'Ana' } } })
  })

  it('subscribe writes both membership records', async () => {
    const client = fakeClient()
    await DynamoDbConnectionStore.create({ client, table: 'ws' }).subscribe('a', 'room')
    expect(client.put).toHaveBeenCalledWith({ TableName: 'ws', Item: { pk: 'CHAN#room', sk: 'CONN#a' } })
    expect(client.put).toHaveBeenCalledWith({ TableName: 'ws', Item: { pk: 'CONN#a', sk: 'CHAN#room' } })
  })

  it('unsubscribe deletes both membership records', async () => {
    const client = fakeClient()
    await DynamoDbConnectionStore.create({ client }).unsubscribe('a', 'room')
    expect(client.delete).toHaveBeenCalledWith({ TableName: T, Key: { pk: 'CHAN#room', sk: 'CONN#a' } })
    expect(client.delete).toHaveBeenCalledWith({ TableName: T, Key: { pk: 'CONN#a', sk: 'CHAN#room' } })
  })

  it('connectionsFor and members read the channel index', async () => {
    const client = fakeClient()
    client.query.mockResolvedValue({ Items: [{ pk: 'CHAN#room', sk: 'CONN#a' }, { pk: 'CHAN#room', sk: 'CONN#b' }] })
    const store = DynamoDbConnectionStore.create({ client })
    expect(await store.connectionsFor('room')).toEqual([{ id: 'a' }, { id: 'b' }])
    expect(await store.members('room')).toEqual([{ connectionId: 'a' }, { connectionId: 'b' }])
  })

  it('remove deletes the meta record and cleans up channel memberships (both sides)', async () => {
    const client = fakeClient()
    client.query.mockResolvedValue({ Items: [{ pk: 'CONN#a', sk: 'META' }, { pk: 'CONN#a', sk: 'CHAN#room' }] })
    await DynamoDbConnectionStore.create({ client }).remove('a')
    expect(client.delete).toHaveBeenCalledWith({ TableName: T, Key: { pk: 'CHAN#room', sk: 'CONN#a' } })
    expect(client.delete).toHaveBeenCalledWith({ TableName: T, Key: { pk: 'CONN#a', sk: 'CHAN#room' } })
    expect(client.delete).toHaveBeenCalledWith({ TableName: T, Key: { pk: 'CONN#a', sk: 'META' } })
    expect(client.delete).toHaveBeenCalledTimes(3)
  })

  it('remove tolerates an empty query result', async () => {
    const client = fakeClient()
    await DynamoDbConnectionStore.create({ client }).remove('ghost')
    expect(client.delete).not.toHaveBeenCalled()
  })
})

describe('DynamoDbConnectionStore (lazy SDK)', () => {
  afterEach(() => { vi.doUnmock('@aws-sdk/client-dynamodb'); vi.doUnmock('@aws-sdk/lib-dynamodb'); vi.resetModules() })

  it('lazily builds a DynamoDBDocument client', async () => {
    vi.resetModules()
    const doc = { put: vi.fn().mockResolvedValue({}), delete: vi.fn(), query: vi.fn() }
    const from = vi.fn(() => doc)
    const DynamoDBClient = vi.fn()
    vi.doMock('@aws-sdk/client-dynamodb', () => ({ DynamoDBClient }))
    vi.doMock('@aws-sdk/lib-dynamodb', () => ({ DynamoDBDocument: { from } }))
    const { DynamoDbConnectionStore: Fresh } = await import('../../src/drivers/DynamoDbConnectionStore')
    const store = Fresh.create({ region: 'us-east-1' })
    await store.add({ id: 'a' })
    expect(DynamoDBClient).toHaveBeenCalledWith({ region: 'us-east-1' })
    expect(from).toHaveBeenCalled()
    expect(doc.put).toHaveBeenCalled()
  })

  it('builds without a region when none is given', async () => {
    vi.resetModules()
    const doc = { put: vi.fn().mockResolvedValue({}), delete: vi.fn(), query: vi.fn() }
    const DynamoDBClient = vi.fn()
    vi.doMock('@aws-sdk/client-dynamodb', () => ({ DynamoDBClient }))
    vi.doMock('@aws-sdk/lib-dynamodb', () => ({ DynamoDBDocument: { from: vi.fn(() => doc) } }))
    const { DynamoDbConnectionStore: Fresh } = await import('../../src/drivers/DynamoDbConnectionStore')
    await Fresh.create().add({ id: 'a' })
    expect(DynamoDBClient).toHaveBeenCalledWith({})
  })

  it('throws a helpful error when the SDK is missing', async () => {
    vi.resetModules()
    vi.doMock('@aws-sdk/client-dynamodb', () => { throw new Error('Cannot find module') })
    vi.doMock('@aws-sdk/lib-dynamodb', () => ({ DynamoDBDocument: { from: vi.fn() } }))
    const { DynamoDbConnectionStore: Fresh } = await import('../../src/drivers/DynamoDbConnectionStore')
    await expect(Fresh.create().add({ id: 'a' })).rejects.toThrow(/DynamoDB connection store requires/)
  })
})
