import { BlueprintContext, IBlueprint, ClassType } from '@stone-js/core'
import { EnsureCorsHeadersHook } from '../../src/hooks/EnsureCorsHeadersHook'
import { CORSHeadersMiddleware } from '../../src/middleware/CORSHeadersMiddleware'
import { MetaHandleCorsMiddleware } from '../../src/middleware/HandleCorsMiddleware'

describe('CORSHeadersMiddleware', () => {
  it('should register MetaHandleCorsMiddleware and EnsureCorsHeadersHook in the blueprint and call next()', async () => {
    // Create a mock blueprint with spies on the `add` method
    const add = vi.fn().mockReturnThis()

    const blueprint = { add } as unknown as IBlueprint

    // Create a mock context
    const context = {
      blueprint,
      modules: []
    } as unknown as BlueprintContext<IBlueprint, ClassType>

    // Create a mock next function
    const next = vi.fn().mockResolvedValue(blueprint)

    // Run the middleware
    const result = await CORSHeadersMiddleware(context, next)

    // Verify that blueprint.add was called with correct arguments
    expect(add).toHaveBeenCalledWith('stone.kernel.middleware', [MetaHandleCorsMiddleware])
    expect(add).toHaveBeenCalledWith('stone.lifecycleHooks.onBuildingRawResponse', [EnsureCorsHeadersHook])

    // Verify that next was called with context
    expect(next).toHaveBeenCalledWith(context)

    // Verify that the result is the updated blueprint
    expect(result).toBe(blueprint)
  })
})
