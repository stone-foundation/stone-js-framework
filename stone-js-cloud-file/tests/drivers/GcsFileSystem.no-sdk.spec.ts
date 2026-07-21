import { GcsFileSystem } from '../../src/drivers/GcsFileSystem'
import { CloudFileError } from '../../src/errors/CloudFileError'

vi.mock('@google-cloud/storage', () => { throw new Error('Cannot find module @google-cloud/storage') })

describe('GcsFileSystem without @google-cloud/storage', () => {
  it('throws a helpful CloudFileError instructing to install the SDK', async () => {
    await expect(GcsFileSystem.create({ bucket: 'b' }).exists('a')).rejects.toThrow(/@google-cloud\/storage/)
  })
})
