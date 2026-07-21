import { S3FileSystem } from '../../src/drivers/S3FileSystem'
import { CloudFileError } from '../../src/errors/CloudFileError'

// Simulate the optional SDK not being installed: the dynamic import rejects.
vi.mock('@aws-sdk/client-s3', () => { throw new Error('Cannot find module @aws-sdk/client-s3') })

describe('S3FileSystem without @aws-sdk/client-s3', () => {
  it('throws a helpful CloudFileError instructing to install the SDK', async () => {
    await expect(S3FileSystem.create({ bucket: 'b' }).exists('a.txt')).rejects.toThrow(/@aws-sdk\/client-s3/)
    await expect(S3FileSystem.create({ bucket: 'b' }).exists('a.txt')).rejects.toThrow(CloudFileError)
  })
})
