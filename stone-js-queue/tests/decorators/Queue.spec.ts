import { addBlueprint } from '@stone-js/core'
import { Queue } from '../../src/decorators/Queue'

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

describe('Queue (enable decorator)', () => {
  it('registers the provider and sets the driver as the default connection', () => {
    Queue({ driver: 'memory' })(class {})
    const bp = lastBlueprint()
    expect(bp.stone.queue.default).toBe('memory')
    expect(bp.stone.queue.connections[0]).toMatchObject({ name: 'memory', driver: 'memory' })
    expect(bp.stone.providers).toHaveLength(1)
  })

  it('honours a custom connection name', () => {
    Queue({ driver: 'redis', name: 'jobs', url: 'redis://x' })(class {})
    expect(lastBlueprint().stone.queue.default).toBe('jobs')
  })

  it('defineQueue / defineJobHandler build config fragments', async () => {
    const { defineQueue, defineJobHandler } = await import('../../src/options/QueueBlueprint')
    expect(defineQueue({ default: 'memory' })).toEqual({ queue: { default: 'memory' } })
    expect(defineJobHandler('send', SendEmailStub, { isClass: true })).toEqual({ name: 'send', module: SendEmailStub, isClass: true })
    expect(defineJobHandler('ping', pingStub)).toEqual({ name: 'ping', module: pingStub })
  })
})

class SendEmailStub {}
const pingStub = (): void => {}
