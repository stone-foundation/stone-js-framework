import { defineJobHandler } from '../../src/options/QueueBlueprint'
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

})

class SendEmailStub {}
const pingStub = (): void => {}

describe('defineJobHandler', () => {
  it('builds a job-handler meta-module for the imperative API', () => {
    // The imperative counterpart of `@JobHandler`, and a different kind of helper from the config
    // fragments that were removed: it declares a module, not a configuration bucket.
    class SendEmail {}

    expect(defineJobHandler('send-email', SendEmail, { isClass: true })).toEqual({
      name: 'send-email',
      module: SendEmail,
      isClass: true
    })
    expect(defineJobHandler('resize', () => {})).toEqual({
      name: 'resize',
      module: expect.any(Function)
    })
  })
})
