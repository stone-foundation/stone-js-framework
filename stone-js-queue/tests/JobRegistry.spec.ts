import { JobRegistry } from '../src/JobRegistry'
import { QueueError } from '../src/errors/QueueError'

describe('JobRegistry', () => {
  afterEach(() => { JobRegistry.setInstance(undefined) })

  it('registers and resolves a function handler', async () => {
    const registry = JobRegistry.create()
    const fn = vi.fn(async () => 'ok')
    registry.register('a', fn)
    expect(registry.has('a')).toBe(true)
    await registry.resolve('a')({}, {} as any)
    expect(fn).toHaveBeenCalled()
  })

  it('registers an object handler and binds its method', async () => {
    const registry = JobRegistry.create()
    const obj = { value: 42, async handle (this: any) { return this.value } }
    registry.register('b', obj)
    expect(await registry.resolve('b')({}, {} as any)).toBe(42)
  })

  it('supports a custom action method', async () => {
    const registry = JobRegistry.create()
    const obj = { async run () { return 'ran' } }
    registry.register('c', obj as any, 'run')
    expect(await registry.resolve('c')({}, {} as any)).toBe('ran')
  })

  it('throws for an unregistered job', () => {
    expect(() => JobRegistry.create().resolve('missing')).toThrow(QueueError)
  })

  it('throws when an object handler lacks the action method', () => {
    expect(() => JobRegistry.create().register('d', {} as any)).toThrow(QueueError)
  })

  it('publishes and clears a process-wide instance', () => {
    const registry = JobRegistry.create()
    JobRegistry.setInstance(registry)
    expect(JobRegistry.getInstance()).toBe(registry)
    JobRegistry.setInstance(undefined)
    expect(JobRegistry.getInstance()).toBeUndefined()
  })
})
