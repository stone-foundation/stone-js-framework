import { RealtimeServiceProvider } from '../src/RealtimeServiceProvider'
import { RealtimeClientServiceProvider } from '../src/RealtimeClientServiceProvider'
import { realtimeBlueprint, defineRealtime, defineRealtimeGateway } from '../src/options/RealtimeBlueprint'
import { realtimeClientBlueprint } from '../src/options/RealtimeClientBlueprint'

/* eslint-disable @typescript-eslint/no-extraneous-class */

describe('realtime blueprints & define* helpers', () => {
  it('the server blueprint registers the RealtimeServiceProvider', () => {
    expect(realtimeBlueprint.stone.realtime).toEqual({})
    expect(realtimeBlueprint.stone.providers).toContain(RealtimeServiceProvider)
  })

  it('the client blueprint registers the RealtimeClientServiceProvider', () => {
    expect(realtimeClientBlueprint.stone.providers).toContain(RealtimeClientServiceProvider)
  })

  it('defineRealtime wraps a config fragment', () => {
    expect(defineRealtime({ default: 'memory' })).toEqual({ realtime: { default: 'memory' } })
  })

  it('defineRealtimeGateway builds a gateway meta-module', () => {
    class Chat {}
    expect(defineRealtimeGateway(Chat, { isClass: true })).toEqual({ module: Chat, isClass: true })
    const fn = (): void => {}
    expect(defineRealtimeGateway(fn)).toEqual({ module: fn })
  })
})
