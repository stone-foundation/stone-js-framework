import { S3FileSystem } from '../../src/drivers/S3FileSystem'
import { CloudFileError } from '../../src/errors/CloudFileError'

// client-s3 is available (real dev dep), but the presigner is not installed.
vi.mock('@aws-sdk/s3-request-presigner', () => { throw new Error('Cannot find module @aws-sdk/s3-request-presigner') })

describe('S3FileSystem without @aws-sdk/s3-request-presigner', () => {
  it('throws a helpful CloudFileError when minting a signed URL', async () => {
    await expect(S3FileSystem.create({ bucket: 'b' }).temporaryUrl('a.txt')).rejects.toThrow(/s3-request-presigner/)
  })
})
