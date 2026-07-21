import { KeyRoutingEventHandler } from '../src/KeyRoutingEventHandler'
import { KeyRoutingError } from '../src/errors/KeyRoutingError'
import { KeyRoutingServiceProvider } from '../src/KeyRoutingServiceProvider'
import { keyRoutingBlueprint, defineKeyRouting, defineKeyRoute } from '../src/options/KeyRoutingBlueprint'
import { metaKeyRoutingBlueprintMiddleware, SetKeyRoutingEventHandlerMiddleware } from '../src/middleware/KeyRoutingBlueprintMiddleware'

/* eslint-disable @typescript-eslint/no-extraneous-class */

describe('keyRoutingBlueprint & define* helpers', () => {
  it('registers the provider and the blueprint middleware', () => {
    expect(keyRoutingBlueprint.stone.keyRouting).toEqual({})
    expect(keyRoutingBlueprint.stone.providers).toContain(KeyRoutingServiceProvider)
    expect(keyRoutingBlueprint.stone.blueprint?.middleware).toHaveLength(1)
  })

  it('defineKeyRouting wraps a config fragment', () => {
    expect(defineKeyRouting({ source: 'type' })).toEqual({ keyRouting: { source: 'type' } })
  })

  it('defineKeyRoute builds a definition', () => {
    class OnShipped {}
    expect(defineKeyRoute('order.shipped', OnShipped, { isClass: true })).toEqual({ key: 'order.shipped', module: OnShipped, isClass: true })
  })
})

describe('SetKeyRoutingEventHandlerMiddleware', () => {
  const run = async (router: any): Promise<any> => {
    const store: Record<string, any> = { 'stone.router': router }
    const blueprint = { get: (k: string) => store[k], set: vi.fn((k: string, v: any) => { store[k] = v }) }
    const next = vi.fn().mockResolvedValue('done')
    return { blueprint, result: await SetKeyRoutingEventHandlerMiddleware({ blueprint } as any, next) }
  }

  it('installs the light router as the kernel event handler', async () => {
    const { blueprint, result } = await run(undefined)
    expect(result).toBe('done')
    expect(blueprint.set).toHaveBeenCalledWith('stone.kernel.eventHandler', { module: KeyRoutingEventHandler, isClass: true })
  })

  it('throws when the full @Routing is also present', async () => {
    await expect(run({ rules: {} })).rejects.toThrow(KeyRoutingError)
  })

  it('exports the ordered middleware list', () => {
    expect(metaKeyRoutingBlueprintMiddleware).toEqual([{ module: SetKeyRoutingEventHandlerMiddleware, priority: 5 }])
  })
})
