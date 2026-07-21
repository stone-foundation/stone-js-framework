import { EventBusError } from '../src/errors/EventBusError'

describe('EventBusError', () => {
  it('is a named integration error', () => {
    const error = new EventBusError('boom')
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('EventBusError')
  })
})
