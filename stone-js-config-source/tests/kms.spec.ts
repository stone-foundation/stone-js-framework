import { kmsDecryptor } from '../src/kms'

const h = vi.hoisted(() => {
  const send = vi.fn()
  const KMSClient = vi.fn(function (this: any, opts: any) { this.opts = opts; this.send = send })
  const DecryptCommand = vi.fn(function (this: any, input: any) { this.input = input })
  return { send, KMSClient, DecryptCommand }
})

vi.mock('@aws-sdk/client-kms', () => ({ KMSClient: h.KMSClient, DecryptCommand: h.DecryptCommand }))

describe('kmsDecryptor', () => {
  beforeEach(() => { h.send.mockReset().mockResolvedValue({ Plaintext: Buffer.from('secret') }); h.KMSClient.mockClear() })

  it('decrypts prefixed strings and passes everything else through', async () => {
    const decrypt = kmsDecryptor({ client: { send: h.send } })
    expect(await decrypt('kms:Y2lwaGVy', 'db.pw')).toBe('secret')
    expect(await decrypt('plain', 'db.host')).toBe('plain')
    expect(await decrypt(42, 'db.port')).toBe(42)
    expect(h.send).toHaveBeenCalledTimes(1)
    expect(h.KMSClient).not.toHaveBeenCalled()
  })

  it('builds a region-less client by default', async () => {
    expect(await kmsDecryptor()('kms:AAAA', 'a')).toBe('secret')
    expect(h.KMSClient).toHaveBeenCalledWith({})
  })

  it('honours a custom prefix and builds a client from region, memoized', async () => {
    const decrypt = kmsDecryptor({ prefix: 'enc:', region: 'us-east-1' })
    await decrypt('enc:AAAA', 'a')
    await decrypt('enc:BBBB', 'b')
    expect(h.KMSClient).toHaveBeenCalledTimes(1) // client built once
    expect(h.KMSClient).toHaveBeenCalledWith({ region: 'us-east-1' })
  })

  it('throws a helpful error without the SDK', async () => {
    vi.resetModules()
    vi.doMock('@aws-sdk/client-kms', () => { throw new Error('Cannot find module') })
    const { kmsDecryptor: fresh } = await import('../src/kms')
    await expect(fresh()('kms:AAAA', 'a')).rejects.toThrow(/@aws-sdk\/client-kms/)
    vi.doUnmock('@aws-sdk/client-kms')
    vi.resetModules()
  })
})
