import { StorageManager } from '@stone-js/filesystem'
import { CloudFileError } from '../src/errors/CloudFileError'
import { CloudFileServiceProvider } from '../src/CloudFileServiceProvider'

const makeContainer = (config: any): any => {
  const container: any = {
    make: vi.fn(() => ({ get: vi.fn(() => config) })),
    instanceIf: vi.fn(() => container),
    alias: vi.fn(() => container),
    singletonIf: vi.fn(() => container)
  }
  return container
}

const storageArg = (container: any): StorageManager => container.instanceIf.mock.calls[0][1]
const fileSystemFactory = (container: any): (() => unknown) =>
  container.singletonIf.mock.calls.find((c: any[]) => c[0] === 'fileSystem')[1]

describe('CloudFileServiceProvider', () => {
  it('binds the StorageManager as `storage` and the default disk as `fileSystem`', () => {
    const container = makeContainer({ default: 's3', disks: [{ name: 's3', driver: 's3', bucket: 'b', region: 'r' }] })

    new CloudFileServiceProvider(container).register()

    expect(container.instanceIf).toHaveBeenCalledWith(StorageManager, expect.any(StorageManager))
    expect(container.alias).toHaveBeenCalledWith(StorageManager, ['storage'])
    expect(container.singletonIf).toHaveBeenCalledWith('fileSystem', expect.any(Function))
    // The s3 disk factory is registered on the manager, and builds an S3 driver on resolution.
    const storage = storageArg(container)
    expect(storage.has('s3')).toBe(true)
    expect(storage.disk('s3').name).toBe('s3')
  })

  it('is zero-config: with no disks, the default local disk resolves as `fileSystem`', () => {
    const container = makeContainer({})

    new CloudFileServiceProvider(container).register()

    const disk: any = fileSystemFactory(container)()
    expect(disk.name).toBe('local')
  })

  it('skips the built-in local driver (already registered by the manager)', () => {
    const container = makeContainer({ disks: [{ name: 'local', driver: 'local' }] })
    expect(() => new CloudFileServiceProvider(container).register()).not.toThrow()
    expect(storageArg(container).has('local')).toBe(true)
  })

  it('throws for an unknown driver', () => {
    const container = makeContainer({ disks: [{ name: 'x', driver: 'ftp' }] })
    expect(() => new CloudFileServiceProvider(container).register()).toThrow(CloudFileError)
  })
})
