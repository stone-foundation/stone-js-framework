import { TelemetryError } from '../../src/errors/TelemetryError'

describe('TelemetryError', () => {
  it('is a named runtime error', () => {
    const err = new TelemetryError('nope')
    expect(err.name).toBe('TelemetryError')
    expect(err.message).toBe('nope')
  })
})
