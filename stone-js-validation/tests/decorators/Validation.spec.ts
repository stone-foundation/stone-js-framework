import { getBlueprint, hasBlueprint } from '@stone-js/core'
import { Validation } from '../../src/decorators/Validation'
import { ValidationServiceProvider } from '../../src/ValidationServiceProvider'
import { validationBlueprint } from '../../src/options/ValidationBlueprint'

describe('@Validation', () => {
  it('declares exactly what its blueprint declares', () => {
    // A module is enabled by its decorator or by its blueprint, and the two must do the same thing.
    // The blueprint is the source of truth; the decorator clones it and overrides its own bucket.
    @Validation()
    class Application {}

    expect(hasBlueprint(Application)).toBe(true)
    const blueprint: any = getBlueprint(Application, { stone: {} })

    expect(blueprint.stone.providers).toContain(ValidationServiceProvider)
    // No kernel middleware here by design: validation runs where it is asked for, not on every event.
    expect(blueprint.stone.kernel).toBeUndefined()
    expect(blueprint.stone.validation).toEqual(validationBlueprint.stone.validation)
  })

  it('carries the options it is given, over the blueprint defaults', () => {
    @Validation({ abortEarly: false })
    class Application {}

    expect((getBlueprint(Application, { stone: {} }) as any).stone.validation).toEqual({ abortEarly: false })
  })

  it('does not leak between two decorated applications, nor mutate the shared constant', () => {
    // Sharing the exported constant would let one application's options bleed into another's, which
    // only shows up in a monorepo running several apps from one build.
    @Validation({ abortEarly: false })
    class First {}

    @Validation({ abortEarly: true })
    class Second {}

    expect((getBlueprint(First, { stone: {} }) as any).stone.validation.abortEarly).toBe(false)
    expect((getBlueprint(Second, { stone: {} }) as any).stone.validation.abortEarly).toBe(true)
    expect(validationBlueprint.stone.validation).not.toHaveProperty('abortEarly')
  })
})
