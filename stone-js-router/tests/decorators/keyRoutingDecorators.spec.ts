import { addBlueprint, setMetadata, SERVICE_KEY } from '@stone-js/core'
import { KEY_ROUTING_KEY } from '../../src/decorators/OnKey'
import { KeyRouting } from '../../src/decorators/KeyRouting'
import { KeyHandler } from '../../src/decorators/KeyHandler'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    setMetadata: vi.fn(() => {}),
    classDecoratorLegacyWrapper: (fn: Function) => { fn(class {}, { kind: 'class', name: 'X', metadata: {} }); return fn }
  }
})

describe('KeyRouting decorator', () => {
  it('applies the key-routing blueprint with options', () => {
    KeyRouting({ source: 'detail-type' })(class {})
    const override = vi.mocked(addBlueprint).mock.calls.at(-1)?.[3] as any
    expect(override.stone.keyRouting).toEqual({ source: 'detail-type' })
  })

  it('defaults to an empty config', () => {
    KeyRouting()(class {})
    const override = vi.mocked(addBlueprint).mock.calls.at(-1)?.[3] as any
    expect(override.stone.keyRouting).toEqual({})
  })
})

describe('KeyHandler decorator', () => {
  it('registers the class as a service and contributes a handler', () => {
    class Handlers {}
    KeyHandler()(Handlers)
    expect(setMetadata).toHaveBeenCalledWith(expect.anything(), SERVICE_KEY, expect.objectContaining({ isClass: true }))
    const override = vi.mocked(addBlueprint).mock.calls.at(-1)?.[3] as any
    expect(override.stone.keyRouting.handlers[0]).toMatchObject({ module: Handlers, isClass: true })
  })
})

describe('OnKey', () => {
  it('exposes the key-routing metadata key', () => {
    expect(KEY_ROUTING_KEY).toBe(Symbol.for('stone.keyRouting.onKey'))
  })
})
