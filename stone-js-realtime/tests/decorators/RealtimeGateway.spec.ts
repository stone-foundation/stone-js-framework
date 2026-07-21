import { addBlueprint, setMetadata, SERVICE_KEY } from '@stone-js/core'
import { RealtimeGateway } from '../../src/decorators/RealtimeGateway'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    setMetadata: vi.fn(() => {}),
    classDecoratorLegacyWrapper: vi.fn((fn: Function) => { fn(class {}, { kind: 'class', name: 'X', metadata: {} }); return fn })
  }
})

describe('RealtimeGateway decorator', () => {
  it('registers the class as a service and contributes a gateway entry', () => {
    class Chat {}
    RealtimeGateway()(Chat)

    expect(setMetadata).toHaveBeenCalledWith(expect.anything(), SERVICE_KEY, expect.objectContaining({ isClass: true }))
    const override = vi.mocked(addBlueprint).mock.calls.at(-1)?.[3] as any
    expect(override.stone.realtime.gateways[0]).toMatchObject({ module: Chat, isClass: true })
  })
})
