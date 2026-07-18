import { isMetaFunctionModule } from '../../src/utils'
import { FunctionalPipe, NextPipe } from '@stone-js/pipeline'
import { BlueprintContext, IBlueprint, ClassType, Promiseable } from '../../src/declarations'
import { defineAdapterErrorHandler, defineAdapterMiddleware } from '../../src/blueprint/AdapterUtils'

describe('defineAdapterErrorHandler', () => {
  const createMockBlueprint = (isMatch: boolean, set = vi.fn()): IBlueprint => ({
    is: vi.fn((key: string, value: string) => isMatch),
    set
  }) as unknown as IBlueprint

  const next = vi.fn()

  it('registers functional handler when adapter matches', async () => {
    const handler = vi.fn()
    const blueprint = createMockBlueprint(true)
    next.mockResolvedValueOnce(blueprint)

    const partial = defineAdapterErrorHandler(handler, {
      error: ['FunctionalError'],
      platform: 'node'
    })

    const middleware = partial.stone?.blueprint?.middleware[0]
    isMetaFunctionModule<FunctionalPipe>(middleware) && await middleware.module({ blueprint } as unknown as BlueprintContext<IBlueprint, ClassType>, next)

    expect(blueprint.set).toHaveBeenCalledWith(
      'stone.adapter.errorHandlers.FunctionalError',
      expect.objectContaining({ module: handler, platform: 'node' })
    )
  })

  it('registers class handler when isFactory is false', async () => {
    class HandlerClass {
      handle (_error: any): Promiseable<any> {
        // Handle error
      }
    }
    const blueprint = createMockBlueprint(true)
    blueprint.is = vi.fn().mockImplementation((key, value) => key === 'stone.adapter.alias' && value === 'cli')
    next.mockResolvedValueOnce(blueprint)

    const partial = defineAdapterErrorHandler(HandlerClass, {
      error: 'ClassError',
      isClass: true,
      adapterAlias: 'cli'
    })

    const middleware = partial.stone?.blueprint?.middleware[0]
    isMetaFunctionModule<FunctionalPipe>(middleware) && await middleware.module({ blueprint } as unknown as BlueprintContext<IBlueprint, ClassType>, next)

    expect(blueprint.set).toHaveBeenCalledWith(
      'stone.adapter.errorHandlers.ClassError',
      expect.objectContaining({ module: HandlerClass, isClass: true, adapterAlias: 'cli' })
    )
  })

  it('skips registration if adapter does not match', async () => {
    const set = vi.fn()
    const blueprint = createMockBlueprint(false, set)
    next.mockResolvedValueOnce(blueprint)

    const partial = defineAdapterErrorHandler((_error: any): Promiseable<any> => {}, {
      error: 'SkippedError',
      platform: 'lambda'
    })

    const middleware = partial.stone?.blueprint?.middleware[0]
    isMetaFunctionModule<FunctionalPipe>(middleware) && await middleware.module({ blueprint } as unknown as BlueprintContext<IBlueprint, ClassType>, next)

    expect(set).not.toHaveBeenCalled()
  })

  it('registers multiple errors', async () => {
    const set = vi.fn()
    const blueprint = createMockBlueprint(true, set)
    next.mockResolvedValueOnce(blueprint)

    const partial = defineAdapterErrorHandler((_error: any): Promiseable<any> => {}, {
      error: ['Err1', 'Err2']
    })

    const middleware = partial.stone?.blueprint?.middleware[0]
    isMetaFunctionModule<FunctionalPipe>(middleware) && await middleware.module({ blueprint } as unknown as BlueprintContext<IBlueprint, ClassType>, next)

    expect(set).toHaveBeenCalledTimes(2)
    expect(set).toHaveBeenCalledWith(
      'stone.adapter.errorHandlers.Err1',
      expect.objectContaining({ error: 'Err1' })
    )
    expect(set).toHaveBeenCalledWith(
      'stone.adapter.errorHandlers.Err2',
      expect.objectContaining({ error: 'Err2' })
    )
  })
})

describe('defineAdapterMiddleware', () => {
  const createMockBlueprint = (): IBlueprint => ({
    is: vi.fn(),
    add: vi.fn()
  } as any)

  const createMockContext = (blueprint: IBlueprint): BlueprintContext<IBlueprint, ClassType> => ({
    modules: [],
    blueprint
  })

  const mockNext: NextPipe<BlueprintContext<IBlueprint, ClassType>, IBlueprint> = vi.fn(async ctx => ctx.blueprint)

  const DummyMiddleware = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register middleware for matching platform', async () => {
    const blueprint = createMockBlueprint()
    blueprint.is = vi.fn().mockImplementation((key, value) => key === 'stone.adapter.platform' && value === 'node')

    const result = defineAdapterMiddleware(DummyMiddleware, {
      platform: 'node',
      priority: 10
    })

    const middlewareFn = result.stone?.blueprint?.middleware?.[0]
    isMetaFunctionModule<FunctionalPipe>(middlewareFn) && await middlewareFn.module(createMockContext(blueprint), mockNext)

    expect(blueprint.add).toHaveBeenCalledWith('stone.adapter.middleware', [{
      module: DummyMiddleware,
      platform: 'node',
      priority: 10
    }])
  })

  it('should register middleware for matching alias', async () => {
    const blueprint = createMockBlueprint()
    blueprint.is = vi.fn().mockImplementation((key, value) => key === 'stone.adapter.alias' && value === 'my-adapter')

    const result = defineAdapterMiddleware(DummyMiddleware, {
      adapterAlias: 'my-adapter',
      priority: 5,
      isClass: true
    })

    const middlewareFn = result.stone?.blueprint?.middleware?.[0]
    isMetaFunctionModule<FunctionalPipe>(middlewareFn) && await middlewareFn.module(createMockContext(blueprint), mockNext)

    expect(blueprint.add).toHaveBeenCalledWith('stone.adapter.middleware', [{
      module: DummyMiddleware,
      adapterAlias: 'my-adapter',
      priority: 5,
      isClass: true
    }])
  })

  it('should register middleware when no platform or alias is specified', async () => {
    const blueprint = createMockBlueprint()
    blueprint.is = vi.fn().mockReturnValue(false)

    const result = defineAdapterMiddleware(DummyMiddleware)

    const middlewareFn = result.stone?.blueprint?.middleware?.[0]
    isMetaFunctionModule<FunctionalPipe>(middlewareFn) && await middlewareFn.module(createMockContext(blueprint), mockNext)

    expect(blueprint.add).toHaveBeenCalledWith('stone.adapter.middleware', [{
      module: DummyMiddleware
    }])
  })

  it('should skip registration if platform or alias does not match', async () => {
    const blueprint = createMockBlueprint()
    blueprint.is = vi.fn().mockReturnValue(false)

    const result = defineAdapterMiddleware(DummyMiddleware, {
      adapterAlias: 'x',
      platform: 'y'
    })

    const middlewareFn = result.stone?.blueprint?.middleware?.[0]
    isMetaFunctionModule<FunctionalPipe>(middlewareFn) && middlewareFn.module(createMockContext(blueprint), mockNext)

    expect(blueprint.add).not.toHaveBeenCalled()
  })
})
