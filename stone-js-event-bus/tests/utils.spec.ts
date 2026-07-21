import { defaultExtractor } from '../src/utils'
import { EventBusError } from '../src/errors/EventBusError'

const event = (metadata: any): any => ({ get: (key: string, fallback: any) => (key === 'metadata' ? metadata : fallback) })

describe('defaultExtractor', () => {
  it('reads the key from the configured property and the payload from detail', () => {
    const extract = defaultExtractor('detail-type')
    expect(extract(event({ 'detail-type': 'order.shipped', source: 'app', detail: { id: 1 } }))).toEqual({ key: 'order.shipped', payload: { id: 1 } })
  })

  it('honours a different source property', () => {
    const extract = defaultExtractor('source')
    expect(extract(event({ 'detail-type': 'x', source: 'order.shipped', detail: { id: 1 } })).key).toBe('order.shipped')
  })

  it('falls back to the whole metadata as payload when there is no detail', () => {
    const extract = defaultExtractor('detail-type')
    const meta = { 'detail-type': 'order.shipped' }
    expect(extract(event(meta))).toEqual({ key: 'order.shipped', payload: meta })
  })

  it('returns an undefined key when the property is missing or not a string', () => {
    const extract = defaultExtractor('detail-type')
    expect(extract(event({ 'detail-type': 42 })).key).toBeUndefined()
    expect(extract(event({})).key).toBeUndefined()
    expect(extract(event(undefined)).key).toBeUndefined()
  })
})

describe('EventBusError', () => {
  it('is a named integration error', () => {
    const error = new EventBusError('boom')
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('EventBusError')
  })
})
