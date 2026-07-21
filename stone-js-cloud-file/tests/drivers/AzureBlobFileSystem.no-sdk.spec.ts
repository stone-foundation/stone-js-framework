import { AzureBlobFileSystem } from '../../src/drivers/AzureBlobFileSystem'
import { CloudFileError } from '../../src/errors/CloudFileError'

vi.mock('@azure/storage-blob', () => { throw new Error('Cannot find module @azure/storage-blob') })

describe('AzureBlobFileSystem without @azure/storage-blob', () => {
  it('throws a helpful CloudFileError instructing to install the SDK', async () => {
    await expect(AzureBlobFileSystem.create({ container: 'c', connectionString: 'x' }).exists('a')).rejects.toThrow(/@azure\/storage-blob/)
  })
})
