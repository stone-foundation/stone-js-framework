import { EventBusServiceProvider } from '../src/EventBusServiceProvider'
import { eventBusBlueprint, defineEventBus, defineBusHandler } from '../src/options/EventBusBlueprint'

/* eslint-disable @typescript-eslint/no-extraneous-class */

describe('event-bus blueprint & define* helpers', () => {
  it('the blueprint registers the provider and the blueprint middleware', () => {
    expect(eventBusBlueprint.stone.eventBus).toEqual({})
    expect(eventBusBlueprint.stone.providers).toContain(EventBusServiceProvider)
    expect(eventBusBlueprint.stone.blueprint?.middleware).toHaveLength(1)
  })

  it('defineEventBus wraps a config fragment', () => {
    expect(defineEventBus({ default: 'cloud' })).toEqual({ eventBus: { default: 'cloud' } })
  })

  it('defineBusHandler builds a handler meta-module', () => {
    class Orders {}
    expect(defineBusHandler('order.shipped', Orders, { isClass: true })).toEqual({ name: 'order.shipped', module: Orders, isClass: true })
    const fn = (): void => {}
    expect(defineBusHandler(undefined, fn)).toEqual({ name: undefined, module: fn })
  })
})
