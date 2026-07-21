import { UploadService } from '../app/UploadService'

vi.mock(import('@stone-js/core'), async (importOriginal) => ({ ...(await importOriginal()), Service: vi.fn(() => vi.fn()) }))

describe('UploadService', () => {
  it('records metadata and lists it', () => {
    const service = new UploadService()
    const record = service.record({ id: 'u1', key: 'avatars/u1.png', contentType: 'image/png' })

    expect(record).toEqual({ id: 'u1', key: 'avatars/u1.png', contentType: 'image/png' })
    expect(service.all()).toEqual([record])
  })
})
