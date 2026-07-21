import { ssmSource } from '../../src/drivers/SsmConfigSource'
import { secretsSource } from '../../src/drivers/SecretsConfigSource'
import { ConfigSourceError } from '../../src/errors/ConfigSourceError'

const ssm = vi.hoisted(() => {
  const send = vi.fn()
  const SSMClient = vi.fn(function (this: any, opts: any) { this.opts = opts; this.send = send })
  const GetParametersByPathCommand = vi.fn(function (this: any, input: any) { this.input = input })
  return { send, SSMClient, GetParametersByPathCommand }
})
const sm = vi.hoisted(() => {
  const send = vi.fn()
  const SecretsManagerClient = vi.fn(function (this: any, opts: any) { this.opts = opts; this.send = send })
  const GetSecretValueCommand = vi.fn(function (this: any, input: any) { this.input = input })
  return { send, SecretsManagerClient, GetSecretValueCommand }
})

vi.mock('@aws-sdk/client-ssm', () => ({ SSMClient: ssm.SSMClient, GetParametersByPathCommand: ssm.GetParametersByPathCommand }))
vi.mock('@aws-sdk/client-secrets-manager', () => ({ SecretsManagerClient: sm.SecretsManagerClient, GetSecretValueCommand: sm.GetSecretValueCommand }))

describe('SsmConfigSource', () => {
  beforeEach(() => { ssm.send.mockReset(); ssm.SSMClient.mockClear(); ssm.GetParametersByPathCommand.mockClear() })

  it('nests parameters relative to the path, across pages', async () => {
    ssm.send
      .mockResolvedValueOnce({ Parameters: [{ Name: '/app/db/url', Value: 'u' }], NextToken: 't' })
      .mockResolvedValueOnce({ Parameters: [{ Name: '/app/db/port', Value: '5432' }] })
    const client = { send: ssm.send }
    expect(await ssmSource({ path: '/app/', client }).load()).toEqual({ db: { url: 'u', port: '5432' } })
    expect(ssm.GetParametersByPathCommand).toHaveBeenCalledWith(expect.objectContaining({ Path: '/app/', Recursive: true, WithDecryption: true }))
    expect(ssm.SSMClient).not.toHaveBeenCalled()
  })

  it('builds a client from region when none is provided', async () => {
    ssm.send.mockResolvedValue({ Parameters: [] })
    await ssmSource({ path: '/app', region: 'us-east-1' }).load()
    expect(ssm.SSMClient).toHaveBeenCalledWith({ region: 'us-east-1' })
  })

  it('builds a region-less client and tolerates a missing Parameters list', async () => {
    ssm.send.mockResolvedValue({})
    expect(await ssmSource({ path: '/app' }).load()).toEqual({})
    expect(ssm.SSMClient).toHaveBeenCalledWith({})
  })

  it('throws a helpful error without the SDK', async () => {
    vi.resetModules()
    vi.doMock('@aws-sdk/client-ssm', () => { throw new Error('Cannot find module') })
    const { ssmSource: fresh } = await import('../../src/drivers/SsmConfigSource')
    await expect(fresh({ path: '/app' }).load()).rejects.toThrow(/@aws-sdk\/client-ssm/)
    vi.doUnmock('@aws-sdk/client-ssm')
    vi.resetModules()
  })
})

describe('SecretsConfigSource', () => {
  beforeEach(() => { sm.send.mockReset(); sm.SecretsManagerClient.mockClear() })

  it('parses the secret JSON value', async () => {
    sm.send.mockResolvedValue({ SecretString: '{"db":{"url":"u"}}' })
    expect(await secretsSource({ secretId: 'app', client: { send: sm.send } }).load()).toEqual({ db: { url: 'u' } })
  })

  it('returns {} when there is no string value', async () => {
    sm.send.mockResolvedValue({ SecretBinary: new Uint8Array() })
    expect(await secretsSource({ secretId: 'app', region: 'us-east-1' }).load()).toEqual({})
    expect(sm.SecretsManagerClient).toHaveBeenCalledWith({ region: 'us-east-1' })
  })

  it('throws on invalid JSON (region-less client)', async () => {
    sm.send.mockResolvedValue({ SecretString: 'not json' })
    await expect(secretsSource({ secretId: 'app' }).load()).rejects.toThrow(ConfigSourceError)
    expect(sm.SecretsManagerClient).toHaveBeenCalledWith({})
  })

  it('throws a helpful error without the SDK', async () => {
    vi.resetModules()
    vi.doMock('@aws-sdk/client-secrets-manager', () => { throw new Error('Cannot find module') })
    const { secretsSource: fresh } = await import('../../src/drivers/SecretsConfigSource')
    await expect(fresh({ secretId: 'app' }).load()).rejects.toThrow(/@aws-sdk\/client-secrets-manager/)
    vi.doUnmock('@aws-sdk/client-secrets-manager')
    vi.resetModules()
  })
})
