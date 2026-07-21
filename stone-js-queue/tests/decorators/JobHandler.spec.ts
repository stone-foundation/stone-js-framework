import { addBlueprint, setMetadata, SERVICE_KEY } from '@stone-js/core'
import { JobHandler } from '../../src/decorators/JobHandler'

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

describe('JobHandler decorator', () => {
  it('registers the class as a service and contributes a handler entry', () => {
    class SendEmail { async handle (): Promise<void> {} }
    JobHandler('send-email')(SendEmail)

    expect(setMetadata).toHaveBeenCalledWith(expect.anything(), SERVICE_KEY, expect.objectContaining({ isClass: true }))
    const override = vi.mocked(addBlueprint).mock.calls.at(-1)?.[3] as any
    expect(override.stone.queue.handlers[0]).toMatchObject({ name: 'send-email', module: SendEmail, isClass: true, action: 'handle' })
  })

  it('honours a custom action', () => {
    class Job { async run (): Promise<void> {} }
    JobHandler('do', { action: 'run' })(Job)
    const override = vi.mocked(addBlueprint).mock.calls.at(-1)?.[3] as any
    expect(override.stone.queue.handlers[0].action).toBe('run')
  })
})
