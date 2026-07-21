import { resolveModuleDefault } from '../src/utils'
import { eventKey } from '../src/constants'
import { RealtimeError } from '../src/errors/RealtimeError'

describe('utils & constants', () => {
  it('resolveModuleDefault unwraps a default export or returns the namespace', () => {
    expect(resolveModuleDefault({ default: 'x' })).toBe('x')
    expect(resolveModuleDefault({ a: 1 })).toEqual({ a: 1 })
    expect(resolveModuleDefault(undefined)).toBeUndefined()
  })

  it('eventKey builds a channel:event routing key', () => {
    expect(eventKey('room:1', 'message')).toBe('event:room:1:message')
  })
})

describe('RealtimeError', () => {
  it('is a named integration error carrying a cause', () => {
    const error = new RealtimeError('boom', { cause: new Error('why') })
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('RealtimeError')
    expect(error.message).toBe('boom')
  })
})
