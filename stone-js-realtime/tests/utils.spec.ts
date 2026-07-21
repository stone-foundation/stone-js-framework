import { eventKey } from '../src/constants'
import { RealtimeError } from '../src/errors/RealtimeError'
import { resolveModuleDefault, connectionOf } from '../src/utils'

describe('utils & constants', () => {
  it('resolveModuleDefault unwraps a default export or returns the namespace', () => {
    expect(resolveModuleDefault({ default: 'x' })).toBe('x')
    expect(resolveModuleDefault({ a: 1 })).toEqual({ a: 1 })
    expect(resolveModuleDefault(undefined)).toBeUndefined()
  })

  it('eventKey builds a channel:event routing key', () => {
    expect(eventKey('room:1', 'message')).toBe('event:room:1:message')
  })

  it('connectionOf reads the connection a WS adapter attached to the event metadata', () => {
    const connection = { id: 'c1' }
    const event: any = { get: (key: string, fallback: any) => (key === 'metadata' ? { connection } : fallback) }
    expect(connectionOf(event)).toBe(connection)
    const empty: any = { get: (_key: string, fallback: any) => fallback }
    expect(connectionOf(empty)).toBeUndefined()
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
