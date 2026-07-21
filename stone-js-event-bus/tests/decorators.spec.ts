import { addBlueprint } from '@stone-js/core'
import { EventBus } from '../src/decorators/EventBus'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: vi.fn((fn: Function) => { fn(class {}, { kind: 'class', name: 'X', metadata: {} }); return fn })
  }
})

const lastBlueprint = (): any => vi.mocked(addBlueprint).mock.calls.at(-1)?.[2]

describe('EventBus (enable decorator)', () => {
  it('registers the provider, the connection and default targets', () => {
    EventBus({ driver: 'eventbridge', source: 'my.app' })(class {})
    const bp = lastBlueprint()
    expect(bp.stone.eventBus.default).toBe('eventbridge')
    expect(bp.stone.eventBus.targets).toEqual(['local', 'eventbridge'])
    expect(bp.stone.eventBus.connections[0]).toMatchObject({ name: 'eventbridge', driver: 'eventbridge', source: 'my.app' })
    expect(bp.stone.providers).toHaveLength(1)
  })

  it('honours custom name and targets', () => {
    EventBus({ driver: 'eventbridge', name: 'bus', targets: ['bus'] })(class {})
    const bp = lastBlueprint()
    expect(bp.stone.eventBus.default).toBe('bus')
    expect(bp.stone.eventBus.targets).toEqual(['bus'])
  })
})
