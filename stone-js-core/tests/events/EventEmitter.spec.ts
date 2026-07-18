import { EventEmitter } from '../../src/events/EventEmitter'
import { Event, EventOptions } from '../../src/events/Event'

describe('EventEmitter', () => {
  let emitter: EventEmitter

  beforeEach(() => {
    emitter = EventEmitter.create()
  })

  it('should register and call a named event handler', async () => {
    const spy = vi.fn()
    emitter.on('my:event', spy)

    await emitter.emit('my:event', { data: 123 })

    expect(spy).toHaveBeenCalledWith({ data: 123 })
  })

  it('should support multiple handlers for the same event', async () => {
    const spy1 = vi.fn()
    const spy2 = vi.fn()

    emitter.on('multi', spy1).on('multi', spy2)
    await emitter.emit('multi', 'value')

    expect(spy1).toHaveBeenCalledWith('value')
    expect(spy2).toHaveBeenCalledWith('value')
  })

  it('should remove handler with .off()', async () => {
    const spy = vi.fn()
    emitter.on('my:event', spy)
    emitter.off('my:event', spy)

    await emitter.emit('my:event', 'data')

    expect(spy).not.toHaveBeenCalled()
  })

  it('should emit using Event instance', async () => {
    const spy = vi.fn()
    emitter.on('login', spy)
    class MyEvent extends Event {
      static create (options: EventOptions): MyEvent {
        return new MyEvent(options)
      }
    }

    const event = MyEvent.create({ type: 'login', metadata: { user: 'stone' }, source: { platform: 'cli', rawContext: '', rawEvent: '' } })
    await emitter.emit(event)

    expect(spy).toHaveBeenCalledWith(event)
  })

  it('should call wildcard (*) handlers', async () => {
    const wildcard = vi.fn()
    emitter.on('*', wildcard)

    await emitter.emit('custom:event', 'value')

    expect(wildcard).toHaveBeenCalledWith('custom:event', 'value')
  })

  it('should not fail or throw if emitting unknown event', async () => {
    await expect(emitter.emit('ghost')).resolves.not.toThrow()
  })

  it('should support chaining calls to .on()', () => {
    const result = emitter.on('hello', vi.fn())
    expect(result).toBe(emitter)
  })

  it('should support chaining calls to .off()', () => {
    const result = emitter.off('off:chain', () => {})
    expect(result).toBe(emitter)
  })
})
