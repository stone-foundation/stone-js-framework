import { EventBusServiceProvider } from '../src/EventBusServiceProvider'
import { eventBusBlueprint } from '../src/options/EventBusBlueprint'

describe('event-bus blueprint & define* helpers', () => {
  it('the blueprint registers the emit provider', () => {
    expect(eventBusBlueprint.stone.eventBus).toEqual({})
    expect(eventBusBlueprint.stone.providers).toContain(EventBusServiceProvider)
  })

})
