import { FunctionalPipe } from '@stone-js/pipeline'
import { defineCommand } from '../../src/blueprint/BlueprintUtils'
import { BlueprintContext, ClassType, IBlueprint, IncomingEvent, isMetaFunctionModule } from '@stone-js/core'

// Mocks
const mockOptions = {
  name: 'my:command',
  desc: 'A test command',
  args: ['<arg>']
}

const createMockBlueprint = (isMatch: boolean, add = vi.fn()): IBlueprint => ({
  add,
  is: vi.fn((_key: string, _value: string) => isMatch)
}) as unknown as IBlueprint

const next = vi.fn()

describe('defineCommand', () => {
  it('should define a functional command (no isFactory)', async () => {
    const handler = async (_event: IncomingEvent): Promise<void> => {}

    const blueprint = createMockBlueprint(true)
    next.mockResolvedValueOnce(blueprint)

    const partial = defineCommand(handler, mockOptions)

    const middleware = partial.stone?.blueprint?.middleware[0]
    isMetaFunctionModule<FunctionalPipe>(middleware) && await middleware.module({ blueprint } as unknown as BlueprintContext<IBlueprint, ClassType>, next)

    expect(blueprint.add).toHaveBeenCalledWith(
      'stone.adapter.commands',
      expect.arrayContaining([
        expect.objectContaining({
          module: handler,
          options: mockOptions,
          isClass: undefined,
          isFactory: undefined
        })
      ])
    )
  })

  it('should define a factory command (isFactory = true)', async () => {
    const factoryHandler = (): any => ({
      handle: async (_event: IncomingEvent): Promise<void> => {}
    })

    const blueprint = createMockBlueprint(true)
    next.mockResolvedValueOnce(blueprint)

    const partial = defineCommand(factoryHandler, {
      ...mockOptions,
      isFactory: true
    })

    const middleware = partial.stone?.blueprint?.middleware[0]
    isMetaFunctionModule<FunctionalPipe>(middleware) && await middleware.module({ blueprint } as unknown as BlueprintContext<IBlueprint, ClassType>, next)

    expect(blueprint.add).toHaveBeenCalledWith(
      'stone.adapter.commands',
      expect.arrayContaining([
        expect.objectContaining({
          module: factoryHandler,
          options: { ...mockOptions, isFactory: true },
          isClass: undefined,
          isFactory: true
        })
      ])
    )
  })

  it('should define a class command (isFactory = false)', async () => {
    class MyCommand {
      async handle (_event: IncomingEvent): Promise<void> {}
    }

    const blueprint = createMockBlueprint(true)
    next.mockResolvedValueOnce(blueprint)

    const partial = defineCommand(MyCommand, {
      ...mockOptions,
      isClass: true
    })

    const middleware = partial.stone?.blueprint?.middleware[0]
    isMetaFunctionModule<FunctionalPipe>(middleware) && await middleware.module({ blueprint } as unknown as BlueprintContext<IBlueprint, ClassType>, next)

    expect(blueprint.add).toHaveBeenCalledWith(
      'stone.adapter.commands',
      expect.arrayContaining([
        expect.objectContaining({
          module: MyCommand,
          options: { ...mockOptions, isClass: true },
          isClass: true
        })
      ])
    )
  })

  it('should not register commands when adapter is not node-cli-adapter', async () => {
    const handler = async (): Promise<void> => {}

    const blueprint = createMockBlueprint(false)
    next.mockResolvedValueOnce(blueprint)

    const partial = defineCommand(handler, {
      name: 'noop',
      desc: 'Nothing'
    })

    const middleware = partial.stone?.blueprint?.middleware[0]
    isMetaFunctionModule<FunctionalPipe>(middleware) && await middleware.module({ blueprint } as unknown as BlueprintContext<IBlueprint, ClassType>, next)

    expect(blueprint.add).not.toHaveBeenCalled()
  })
})
