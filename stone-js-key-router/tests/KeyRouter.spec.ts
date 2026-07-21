import { KeyRouter } from '../src/KeyRouter'
import { KeyRouterError } from '../src/errors/KeyRouterError'

describe('KeyRouter', () => {
  it('registers and resolves a function handler', async () => {
    const router = KeyRouter.create()
    const fn = vi.fn(async (a: number, b: number) => a + b)
    router.register('sum', fn)
    expect(router.has('sum')).toBe(true)
    expect(router.keys()).toEqual(['sum'])
    expect(await router.resolve('sum')(2, 3)).toBe(5)
  })

  it('registers an object handler and binds its method', async () => {
    const router = KeyRouter.create()
    const obj = { base: 10, async handle (this: any, n: number) { return this.base + n } }
    router.register('add', obj)
    expect(await router.resolve('add')(5)).toBe(15)
  })

  it('supports a custom action method', async () => {
    const router = KeyRouter.create()
    router.register('run', { async execute () { return 'ok' } } as any, 'execute')
    expect(await router.resolve('run')()).toBe('ok')
  })

  it('dispatch resolves and invokes with arguments', async () => {
    const router = KeyRouter.create()
    router.register('mul', async (a: number, b: number) => a * b)
    expect(await router.dispatch('mul', 4, 5)).toBe(20)
  })

  it('tryResolve returns undefined for an unknown key; resolve/dispatch throw', async () => {
    const router = KeyRouter.create()
    expect(router.tryResolve('nope')).toBeUndefined()
    expect(() => router.resolve('nope')).toThrow(KeyRouterError)
    await expect(router.dispatch('nope')).rejects.toThrow(KeyRouterError)
  })

  it('throws when an object handler lacks the action method', () => {
    expect(() => KeyRouter.create().register('bad', {} as any)).toThrow(KeyRouterError)
  })
})
