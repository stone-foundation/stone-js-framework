import { getBlueprint, hasBlueprint } from '@stone-js/core'
import { Cors } from '../../src/decorators/Cors'
import { corsBlueprint } from '../../src/options/CorsBlueprint'
import { HandleCorsMiddleware } from '../../src/middleware/HandleCorsMiddleware'
import { EnsureCorsHeadersHook } from '../../src/hooks/EnsureCorsHeadersHook'

describe('@Cors', () => {
  it('installs CORS on both dimensions, which is what CORS actually needs', () => {
    // The kernel middleware covers every response the kernel produces; the adapter hook covers the
    // requests that never reach it. Either one alone leaves a hole the browser reports as an opaque
    // network error rather than as the status that was actually sent.
    @Cors()
    class Application {}

    expect(hasBlueprint(Application)).toBe(true)
    const blueprint: any = getBlueprint(Application, { stone: {} })

    expect(blueprint.stone.kernel.middleware).toEqual([
      expect.objectContaining({ module: HandleCorsMiddleware, isClass: true })
    ])
    expect(blueprint.stone.lifecycleHooks.onBuildingRawResponse).toEqual([EnsureCorsHeadersHook])
  })

  it('allows nothing until an origin is named', () => {
    // Enabling CORS must not open the app: with no origin, no Access-Control-Allow-Origin header is
    // emitted at all and the browser keeps enforcing the same-origin policy.
    @Cors()
    class Application {}

    expect((getBlueprint(Application, { stone: {} }) as any).stone.http.cors).toEqual({})
  })

  it('carries the options it is given', () => {
    @Cors({ origin: ['https://app.example.com'], credentials: true, preflightStop: true })
    class Application {}

    expect((getBlueprint(Application, { stone: {} }) as any).stone.http.cors).toEqual({
      origin: ['https://app.example.com'],
      credentials: true,
      preflightStop: true
    })
  })

  it('does not leak options between two decorated applications', () => {
    @Cors({ origin: ['https://a.test'] })
    class First {}

    @Cors({ origin: ['https://b.test'] })
    class Second {}

    expect((getBlueprint(First, { stone: {} }) as any).stone.http.cors.origin).toEqual(['https://a.test'])
    expect((getBlueprint(Second, { stone: {} }) as any).stone.http.cors.origin).toEqual(['https://b.test'])
    // The shared constant must be untouched, or the second app would inherit the first's origins.
    expect(corsBlueprint.stone.http?.cors).toEqual({})
  })
})

describe('corsBlueprint', () => {
  it('is the imperative counterpart of the decorator, declaring the same two levels', () => {
    expect(corsBlueprint.stone.kernel?.middleware).toEqual([
      expect.objectContaining({ module: HandleCorsMiddleware, isClass: true })
    ])
    expect(corsBlueprint.stone.lifecycleHooks?.onBuildingRawResponse).toEqual([EnsureCorsHeadersHook])
  })

  it('declares no blueprint middleware, because CORS never needed one', () => {
    // CORS used to be installed by a build-phase middleware whose only job was to `add` these two
    // entries. A blueprint says the same thing, at the one moment the builder can still read it.
    expect(corsBlueprint.stone).not.toHaveProperty('blueprint')
  })
})
