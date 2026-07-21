import { hash, defaultKey, singleFlight, resolveDecoratorKey, resolveModuleDefault } from '../src/utils'

describe('cache utils', () => {
  it('hash is deterministic and 8 hex chars', () => {
    expect(hash('abc')).toBe(hash('abc'))
    expect(hash('abc')).toMatch(/^[0-9a-f]{8}$/)
    expect(hash('abc')).not.toBe(hash('abd'))
  })

  it('defaultKey combines scope and an args hash, tolerating unserializable args', () => {
    expect(defaultKey('Svc.m', [1, 'a'])).toMatch(/^Svc\.m:[0-9a-f]{8}$/)
    const circular: any = {}; circular.self = circular
    expect(defaultKey('Svc.m', [circular])).toMatch(/^Svc\.m:[0-9a-f]{8}$/)
  })

  it('resolveDecoratorKey handles string, function and derived keys', () => {
    expect(resolveDecoratorKey('fixed', {}, 'm', [])).toBe('fixed')
    expect(resolveDecoratorKey((a: number) => `k:${a}`, {}, 'm', [7])).toBe('k:7')
    expect(resolveDecoratorKey(undefined, { constructor: { name: 'Svc' } }, 'm', [1])).toMatch(/^Svc\.m:/)
    expect(resolveDecoratorKey(undefined, undefined, 'm', [1])).toMatch(/^Cache\.m:/)
  })

  it('resolveModuleDefault returns .default or the module itself', () => {
    expect(resolveModuleDefault({ default: 'X' })).toBe('X')
    expect(resolveModuleDefault('Y')).toBe('Y')
  })

  it('singleFlight shares the in-flight promise then clears it', async () => {
    const inflight = new Map<string, Promise<any>>()
    let resolveFn: (v: string) => void = () => {}
    const factory = vi.fn(async () => await new Promise<string>((r) => { resolveFn = r }))
    const a = singleFlight(inflight, 'k', factory)
    const b = singleFlight(inflight, 'k', factory)
    resolveFn('v')
    expect(await a).toBe('v')
    expect(await b).toBe('v')
    expect(factory).toHaveBeenCalledTimes(1)
    expect(inflight.has('k')).toBe(false)
  })
})
