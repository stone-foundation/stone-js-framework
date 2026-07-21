import { BusEventHandler } from '../src/BusEventHandler'
import {
  metaBusBlueprintMiddleware,
  SetBusEventHandlerMiddleware
} from '../src/middleware/BlueprintMiddleware'

describe('SetBusEventHandlerMiddleware', () => {
  const run = async (listen: any): Promise<any> => {
    const store: Record<string, any> = { 'stone.eventBus.listen': listen }
    const blueprint = { get: (k: string) => store[k], set: vi.fn((k: string, v: any) => { store[k] = v }) }
    const next = vi.fn().mockResolvedValue('done')
    const result = await SetBusEventHandlerMiddleware({ blueprint } as any, next)
    return { blueprint, result }
  }

  it('installs the bus event handler when listen is configured (even empty)', async () => {
    const { blueprint } = await run({})
    expect(blueprint.set).toHaveBeenCalledWith('stone.kernel.eventHandler', { module: BusEventHandler, isClass: true })
  })

  it('does nothing when listen is not configured', async () => {
    const { blueprint, result } = await run(undefined)
    expect(blueprint.set).not.toHaveBeenCalled()
    expect(result).toBe('done')
  })

  it('exports the ordered middleware list', () => {
    expect(metaBusBlueprintMiddleware).toEqual([{ module: SetBusEventHandlerMiddleware, priority: 6 }])
  })
})
