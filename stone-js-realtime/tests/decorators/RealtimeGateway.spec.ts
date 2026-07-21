import { KeyHandler } from '@stone-js/router'
import { RealtimeGateway } from '../../src/decorators/RealtimeGateway'

describe('RealtimeGateway decorator', () => {
  it('is the light router @KeyHandler', () => {
    expect(RealtimeGateway).toBe(KeyHandler)
  })
})
