import { OnKey, KeyHandler, KeyRouting } from '@stone-js/router'
import { OnBusEvent } from '../src/decorators/OnBusEvent'
import { BusHandler } from '../src/decorators/BusHandler'
import { BusListener } from '../src/decorators/BusListener'

describe('bus listen decorators are light-router aliases', () => {
  it('@OnBusEvent is the light router @OnKey', () => {
    expect(OnBusEvent).toBe(OnKey)
    expect(typeof OnBusEvent('order.shipped')).toBe('function')
  })

  it('@BusHandler is the light router @KeyHandler', () => {
    expect(BusHandler).toBe(KeyHandler)
  })

  it('@BusListener is the light router @KeyRouting', () => {
    expect(BusListener).toBe(KeyRouting)
  })
})
