import { FileSystem } from '../../src/storage/FileSystem'
import { supportsSignedUrls } from '../../src/storage/SignedUrl'

describe('supportsSignedUrls', () => {
  const base = {} as FileSystem

  it('returns true when the driver implements both signed-url methods', () => {
    const driver = {
      ...base,
      temporaryUrl: async () => 'https://signed/get',
      temporaryUploadUrl: async () => ({ url: 'https://signed/put', method: 'PUT', headers: {}, expiresIn: 60 })
    } as unknown as FileSystem

    expect(supportsSignedUrls(driver)).toBe(true)
  })

  it('returns false when temporaryUrl is absent (first operand short-circuits)', () => {
    expect(supportsSignedUrls(base)).toBe(false)
  })

  it('returns false when temporaryUploadUrl is absent (second operand fails)', () => {
    const driver = { ...base, temporaryUrl: async () => 'https://signed/get' } as unknown as FileSystem

    expect(supportsSignedUrls(driver)).toBe(false)
  })
})
