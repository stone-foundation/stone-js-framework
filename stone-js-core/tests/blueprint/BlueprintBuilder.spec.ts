import { Config } from '@stone-js/config'
import { Logger } from '../../src/logger/Logger'
import { BlueprintBuilder } from '../../src/blueprint/BlueprintBuilder'

/* eslint-disable @typescript-eslint/no-extraneous-class */

describe('BlueprintBuilder', () => {
  let blueprint: any
  let builder: BlueprintBuilder<any, any>

  beforeEach(() => {
    blueprint = {
      set: vi.fn(),
      get: vi.fn((key, fallback) => {
        if (key === 'stone.lifecycleHooks') return {}
        if (key === 'stone.blueprint.middleware') return []
        if (key === 'stone.blueprint.defaultMiddlewarePriority') return 0
        return fallback
      })
    }

    Logger.getInstance = vi.fn()

    builder = BlueprintBuilder.create(blueprint)
  })

  it('should create a builder with provided blueprint', () => {
    expect(builder).toBeInstanceOf(BlueprintBuilder)
  })

  it('should build the blueprint and call pipeline correctly', async () => {
    const middlewareSpy = vi.fn((context, next) => {
      context.blueprint.set('myValue', context.modules[0].myValue)
      return next(context)
    })
    blueprint = Config.create()
    blueprint.set('stone.blueprint.middleware', [middlewareSpy])

    builder = BlueprintBuilder.create(blueprint)

    const result = await builder.build([{ myValue: 'SomeModule' }])

    expect(result).toBeInstanceOf(Config)
    expect(result.get('myValue')).toBe('SomeModule')
    expect(middlewareSpy).toHaveBeenCalledTimes(1)
  })

  it('fails loudly when a blueprint middleware does not pass the context through', async () => {
    // The shipped-starter bug: an HTTP/kernel middleware registered as a build-phase middleware.
    // Both shapes are `handle(context, next)`, so nothing objects; the chain simply stops carrying
    // the blueprint and every later phase misbehaves far from the cause.
    const httpLikeMiddleware = vi.fn(async (context, next) => {
      await next(context)
      return { statusCode: 204, headers: {} } // an HTTP response, not the context
    })
    blueprint = Config.create()
    blueprint.set('stone.blueprint.middleware', [httpLikeMiddleware])

    builder = BlueprintBuilder.create(blueprint)

    await expect(builder.build([{}])).rejects.toThrow(/did not return the blueprint/)
    // The message must name the contract that was broken, not a helper: registering this through
    // `defineBlueprintMiddleware` is legal, returning something other than `next`'s result is not.
    await expect(builder.build([{}])).rejects.toThrow(/must return `await next\(context\)`/)
  })

  it('does not run the prepared hook when the pipeline lost the blueprint', async () => {
    const hookSpy = vi.fn()
    blueprint = Config.create()
    blueprint.set('stone.blueprint.middleware', [async () => undefined])
    blueprint.set('stone.lifecycleHooks', { onBlueprintPrepared: [hookSpy] })

    builder = BlueprintBuilder.create(blueprint)

    await expect(builder.build([{}])).rejects.toThrow()
    expect(hookSpy).not.toHaveBeenCalled()
  })

  it('should execute lifecycle hooks if present', async () => {
    const hookSpy = vi.fn()

    blueprint.set = vi.fn()
    blueprint.get = vi.fn((key, fallback) => {
      if (key === 'stone.lifecycleHooks') {
        return {
          onPreparingBlueprint: [hookSpy],
          onBlueprintPrepared: [hookSpy]
        }
      }
      return fallback
    })

    builder = BlueprintBuilder.create(blueprint)
    await builder.build([])

    expect(hookSpy).toHaveBeenCalledTimes(2)
    expect(hookSpy).toHaveBeenCalledWith(expect.objectContaining({ blueprint }))
  })

  it('makePipelineOptions should resolve class and factory pipes', () => {
    const mockClassPipe = { module: class Test {}, isClass: true }
    const mockFactoryPipe = { module: () => () => 'created', isFactory: true }

    // @ts-expect-error - private access
    const opts = builder.makePipelineOptions()

    const classInstance = opts.resolver?.(mockClassPipe as any)
    const factoryInstance: any = opts.resolver?.(mockFactoryPipe as any)

    expect(classInstance).toBeInstanceOf(mockClassPipe.module)
    expect(factoryInstance()).toBe('created')
    expect(typeof opts.hooks).toBe('object')
  })
})
