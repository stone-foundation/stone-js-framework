import { EventBusServiceProvider } from '../src/EventBusServiceProvider'
import { eventBusBlueprint, defineEventBus } from '../src/options/EventBusBlueprint'

describe('event-bus blueprint & define* helpers', () => {
  it('the blueprint registers the emit provider', () => {
    expect(eventBusBlueprint.stone.eventBus).toEqual({})
    expect(eventBusBlueprint.stone.providers).toContain(EventBusServiceProvider)
  })

  it('defineEventBus wraps a config fragment', () => {
    expect(defineEventBus({ default: 'cloud' })).toEqual({ eventBus: { default: 'cloud' } })
  })
})
