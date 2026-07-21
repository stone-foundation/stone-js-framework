import { resolveWebSocketServer, parseFrame } from '../src/utils'

describe('resolveWebSocketServer', () => {
  it('prefers the named export, then default-wrapped shapes', () => {
    const named = function () {}
    expect(resolveWebSocketServer({ WebSocketServer: named })).toBe(named)
    expect(resolveWebSocketServer({ default: { WebSocketServer: named } })).toBe(named)
    const def = function () {}
    expect(resolveWebSocketServer({ default: def })).toBe(def)
    const mod = { x: 1 }
    expect(resolveWebSocketServer(mod)).toBe(mod)
  })
})

describe('parseFrame', () => {
  it('parses a JSON string frame', () => {
    expect(parseFrame('{"type":"event","channel":"room","event":"ping"}')).toEqual({ type: 'event', channel: 'room', event: 'ping' })
  })

  it('stringifies non-string payloads (Buffer-like) before parsing', () => {
    const bufferLike = { toString: () => '{"channel":"room"}' }
    expect(parseFrame(bufferLike)).toEqual({ channel: 'room' })
  })

  it('returns undefined for malformed JSON', () => {
    expect(parseFrame('not json')).toBeUndefined()
  })

  it('returns undefined for non-object JSON (number, null)', () => {
    expect(parseFrame('123')).toBeUndefined()
    expect(parseFrame('null')).toBeUndefined()
  })
})
