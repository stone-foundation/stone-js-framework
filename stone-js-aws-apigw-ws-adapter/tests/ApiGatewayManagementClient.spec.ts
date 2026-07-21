import { ApiGatewayManagementClient } from '../src/ApiGatewayManagementClient'

const h = vi.hoisted(() => {
  const send = vi.fn()
  const ApiGatewayManagementApiClient = vi.fn(function (this: any, opts: any) { this.opts = opts; this.send = send })
  const PostToConnectionCommand = vi.fn(function (this: any, input: any) { this.input = input })
  return { send, ApiGatewayManagementApiClient, PostToConnectionCommand }
})

vi.mock('@aws-sdk/client-apigatewaymanagementapi', () => ({
  ApiGatewayManagementApiClient: h.ApiGatewayManagementApiClient,
  PostToConnectionCommand: h.PostToConnectionCommand
}))

describe('ApiGatewayManagementClient', () => {
  beforeEach(() => { h.send.mockReset().mockResolvedValue({}); h.ApiGatewayManagementApiClient.mockClear(); h.PostToConnectionCommand.mockClear() })

  it('builds a client for the endpoint and posts to a connection', async () => {
    const client = ApiGatewayManagementClient.create({ endpoint: 'https://api/prod' })
    await client.postToConnection('c1', '{"a":1}')
    expect(h.ApiGatewayManagementApiClient).toHaveBeenCalledWith({ endpoint: 'https://api/prod' })
    expect(h.PostToConnectionCommand).toHaveBeenCalledWith({ ConnectionId: 'c1', Data: '{"a":1}' })
    expect(h.send).toHaveBeenCalledTimes(1)
  })

  it('reuses a provided client instead of building one', async () => {
    const provided = { send: vi.fn().mockResolvedValue({}) }
    const client = ApiGatewayManagementClient.create({ endpoint: 'https://api/prod', client: provided })
    await client.postToConnection('c1', 'x')
    expect(h.ApiGatewayManagementApiClient).not.toHaveBeenCalled()
    expect(provided.send).toHaveBeenCalledTimes(1)
  })

  it.each([
    { name: 'GoneException' },
    { $metadata: { httpStatusCode: 410 } },
    { statusCode: 410 }
  ])('swallows a stale connection error (%o)', async (error) => {
    h.send.mockRejectedValueOnce(error)
    const client = ApiGatewayManagementClient.create({ endpoint: 'https://api/prod' })
    await expect(client.postToConnection('c1', 'x')).resolves.toBeUndefined()
  })

  it('rethrows other errors', async () => {
    h.send.mockRejectedValueOnce(new Error('boom'))
    const client = ApiGatewayManagementClient.create({ endpoint: 'https://api/prod' })
    await expect(client.postToConnection('c1', 'x')).rejects.toThrow('boom')
  })
})

describe('ApiGatewayManagementClient without the SDK', () => {
  it('throws a helpful error', async () => {
    vi.resetModules()
    vi.doMock('@aws-sdk/client-apigatewaymanagementapi', () => { throw new Error('Cannot find module') })
    const { ApiGatewayManagementClient: Fresh } = await import('../src/ApiGatewayManagementClient')
    await expect(Fresh.create({ endpoint: 'https://api/prod' }).postToConnection('c', 'x')).rejects.toThrow(/@aws-sdk\/client-apigatewaymanagementapi/)
    vi.doUnmock('@aws-sdk/client-apigatewaymanagementapi')
    vi.resetModules()
  })
})
