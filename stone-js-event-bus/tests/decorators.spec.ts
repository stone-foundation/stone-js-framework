import { addBlueprint, setMetadata, SERVICE_KEY } from '@stone-js/core'
import { EventBus } from '../src/decorators/EventBus'
import { BusHandler } from '../src/decorators/BusHandler'
import { BusListener } from '../src/decorators/BusListener'

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

const lastBlueprint = (): any => vi.mocked(addBlueprint).mock.calls.at(-1)?.[2]
const lastOverride = (): any => vi.mocked(addBlueprint).mock.calls.at(-1)?.[3]

describe('EventBus (enable decorator)', () => {
  it('registers the provider, the connection and default targets', () => {
    EventBus({ driver: 'eventbridge', source: 'my.app' })(class {})
    const bp = lastBlueprint()
    expect(bp.stone.eventBus.default).toBe('eventbridge')
    expect(bp.stone.eventBus.targets).toEqual(['local', 'eventbridge'])
    expect(bp.stone.eventBus.connections[0]).toMatchObject({ name: 'eventbridge', driver: 'eventbridge', source: 'my.app' })
    expect(bp.stone.providers).toContain(bp.stone.providers[0])
  })

  it('honours custom name and targets', () => {
    EventBus({ driver: 'eventbridge', name: 'bus', targets: ['bus'] })(class {})
    const bp = lastBlueprint()
    expect(bp.stone.eventBus.default).toBe('bus')
    expect(bp.stone.eventBus.targets).toEqual(['bus'])
  })
})

describe('BusListener (enable listener)', () => {
  it('sets the listen config', () => {
    BusListener({ source: 'detail-type' })(class {})
    expect(lastBlueprint().stone.eventBus.listen).toEqual({ source: 'detail-type' })
  })

  it('defaults to an empty listen config', () => {
    BusListener()(class {})
    expect(lastBlueprint().stone.eventBus.listen).toEqual({})
  })
})

describe('BusHandler decorator', () => {
  it('registers the class as a service and contributes a handler', () => {
    class Orders {}
    BusHandler('order.shipped')(Orders)
    expect(setMetadata).toHaveBeenCalledWith(expect.anything(), SERVICE_KEY, expect.objectContaining({ isClass: true }))
    expect(lastOverride().stone.eventBus.handlers[0]).toMatchObject({ name: 'order.shipped', module: Orders, isClass: true, action: 'handle' })
  })

  it('honours a custom action and a name-less form', () => {
    class Orders {}
    BusHandler(undefined, { action: 'run' })(Orders)
    expect(lastOverride().stone.eventBus.handlers[0]).toMatchObject({ name: undefined, action: 'run' })
  })
})
