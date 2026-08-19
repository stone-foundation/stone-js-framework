import { getBlueprint, hasBlueprint } from '@stone-js/core'
import { Telemetry } from '../../src/decorators/Telemetry'
import { TelemetryServiceProvider } from '../../src/TelemetryServiceProvider'
import { telemetryBlueprint } from '../../src/options/TelemetryBlueprint'
import { TelemetryMiddleware } from '../../src/middleware/TelemetryMiddleware'

describe('@Telemetry', () => {
  it('declares exactly what its blueprint declares', () => {
    // A module is enabled by its decorator or by its blueprint, and the two must do the same thing.
    // The blueprint is the source of truth; the decorator clones it and overrides its own bucket.
    @Telemetry()
    class Application {}

    expect(hasBlueprint(Application)).toBe(true)
    const blueprint: any = getBlueprint(Application, { stone: {} })

    expect(blueprint.stone.providers).toContain(TelemetryServiceProvider)
    // The blueprint is deep-cloned, so the meta entry is a copy; what must survive is the class it
    // points at, which is what the kernel resolves.
    expect(blueprint.stone.kernel.middleware).toEqual([
      expect.objectContaining({ module: TelemetryMiddleware, isClass: true })
    ])
    expect(blueprint.stone.telemetry).toEqual(telemetryBlueprint.stone.telemetry)
  })

  it('carries the options it is given, over the blueprint defaults', () => {
    @Telemetry({ serviceName: 'tasks-api' })
    class Application {}

    expect((getBlueprint(Application, { stone: {} }) as any).stone.telemetry).toEqual({ enabled: true, serviceName: 'tasks-api' })
  })

  it('does not leak between two decorated applications, nor mutate the shared constant', () => {
    // Sharing the exported constant would let one application's options bleed into another's, which
    // only shows up in a monorepo running several apps from one build.
    @Telemetry({ serviceName: 'a' })
    class First {}

    @Telemetry({ serviceName: 'b' })
    class Second {}

    expect((getBlueprint(First, { stone: {} }) as any).stone.telemetry.serviceName).toBe('a')
    expect((getBlueprint(Second, { stone: {} }) as any).stone.telemetry.serviceName).toBe('b')
    // This blueprint ships defaults, so the check is that they are untouched, not that the key is absent.
    expect(telemetryBlueprint.stone.telemetry).toEqual({ enabled: true, serviceName: 'stone-app' })
  })
})
