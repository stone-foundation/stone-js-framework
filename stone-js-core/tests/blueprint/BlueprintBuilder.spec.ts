import { Config } from '@stone-js/config'
import { Logger } from '../../src/logger/Logger'
import { BlueprintBuilder } from '../../src/blueprint/BlueprintBuilder'

/* eslint-disable @typescript-eslint/no-extraneous-class */

describe('BlueprintBuilder', () => {
  let blueprint: any
  let builder: BlueprintBuilder<any, any>

  beforeEach(() => {
    blueprint = {
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

  it('should execute lifecycle hooks if present', async () => {
    const hookSpy = vi.fn()

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
