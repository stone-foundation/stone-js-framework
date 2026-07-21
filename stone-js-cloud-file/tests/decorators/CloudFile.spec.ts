import { addBlueprint } from '@stone-js/core'
import { CloudFile } from '../../src/decorators/CloudFile'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: vi.fn((fn: Function) => { fn(); return fn })
  }
})

const lastBlueprint = (): any => vi.mocked(addBlueprint).mock.calls.at(-1)?.[2]

describe('CloudFile', () => {
  it('registers the provider and sets the given driver as the default disk', () => {
    CloudFile({ driver: 's3', bucket: 'uploads', region: 'eu-west-3' })(class {})

    const bp = lastBlueprint()
    expect(addBlueprint).toHaveBeenCalled()
    expect(bp.stone.filesystem.default).toBe('s3')
    expect(bp.stone.filesystem.disks[0]).toMatchObject({ name: 's3', driver: 's3', bucket: 'uploads', region: 'eu-west-3' })
    expect(bp.stone.providers).toHaveLength(1)
  })

  it('honours a custom disk name', () => {
    CloudFile({ driver: 's3', name: 'media', bucket: 'b' })(class {})
    const bp = lastBlueprint()
    expect(bp.stone.filesystem.default).toBe('media')
    expect(bp.stone.filesystem.disks[0].name).toBe('media')
  })
})
