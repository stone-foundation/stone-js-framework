import { RealtimeServiceProvider } from '../src/RealtimeServiceProvider'
import { RealtimeClientServiceProvider } from '../src/RealtimeClientServiceProvider'
import { realtimeBlueprint } from '../src/options/RealtimeBlueprint'
import { realtimeClientBlueprint } from '../src/options/RealtimeClientBlueprint'

describe('realtime blueprints & define* helpers', () => {
  it('the server blueprint registers the RealtimeServiceProvider', () => {
    expect(realtimeBlueprint.stone.realtime).toEqual({})
    expect(realtimeBlueprint.stone.providers).toContain(RealtimeServiceProvider)
  })

  it('the client blueprint registers the RealtimeClientServiceProvider', () => {
    expect(realtimeClientBlueprint.stone.providers).toContain(RealtimeClientServiceProvider)
  })

})
