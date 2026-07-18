import {
  IBlueprint,
  AdapterContext,
  RawResponseOptions,
  IRawResponseWrapper,
  IAdapterEventBuilder,
  IAdapterErrorHandler,
  AdapterEventHandlerType,
  AdapterEventBuilderType
} from '../../src/declarations'
import { Config } from '@stone-js/config'
import { Logger } from '../../src/logger/Logger'
import { Adapter } from '../../src/adapter/Adapter'
import { OutgoingResponse } from '../../src/events/OutgoingResponse'
import { IntegrationError } from '../../src/errors/IntegrationError'
import { IncomingEvent, IncomingEventOptions } from '../../src/events/IncomingEvent'

/* eslint-disable @typescript-eslint/no-extraneous-class */

/**
 * Mocks
 */
class MockResponseWrapper implements IRawResponseWrapper<string> {
  constructor (readonly options: RawResponseOptions) {}
  respond (): string {
    return `wrapped: ${String(this.options.name)}`
  }
}

class UnitTestAdapter extends Adapter<Record<string, unknown>, string, any, IncomingEvent, IncomingEventOptions, OutgoingResponse> {
  public static create (blueprint: IBlueprint): UnitTestAdapter {
    return new this(blueprint)
  }

  async run<ExecutionResultType = unknown>(): Promise<ExecutionResultType> {
    throw new Error('Method not implemented.')
  }

  public async simulateSendEvent (ctx: AdapterContext<any, any, any, any, any, any>, handler: AdapterEventHandlerType<any, any>): Promise<string> {
    return await this.sendEventThroughDestination(ctx, handler)
  }

  public simulateValidate (ctx: AdapterContext<any, any, any, any, any, any>, handler: AdapterEventHandlerType<any, any>): void {
    return this.validateContextAndEventHandler(ctx, handler)
  }

  public async simulateHooks (name: string, ctx?: AdapterContext<any, any, any, any, any, any>, error?: Error): Promise<void> {
    return await this.executeHooks(name as any, ctx, error)
  }

  public async simulateEventHooks (hook: string, handler: AdapterEventHandlerType<any, any>): Promise<void> {
    return await this.executeEventHandlerHooks(hook as any, handler)
  }

  public simulateResolveHandler (): AdapterEventHandlerType<IncomingEvent, OutgoingResponse> {
    return this.resolveEventHandler()
  }

  public simulateResolveErrorHandler (err: Error): IAdapterErrorHandler<Record<string, unknown>, string, any> {
    return this.resolveErrorHandler(err)
  }

  public async simulateBuildRawResponse (ctx: AdapterContext<any, any, any, any, any, any>, handler: AdapterEventHandlerType<any, any>): Promise<string> {
    return await this.buildRawResponse(ctx, handler)
  }

  public async simulateHandleError (err: Error, ctx: AdapterContext<any, any, any, any, any, any>): Promise<AdapterEventBuilderType<string>> {
    return await this.handleError(err, ctx)
  }

  public async simulateHandleEvent (ctx: AdapterContext<any, any, any, any, any, any>, handler: AdapterEventHandlerType<any, any>): Promise<IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<string>>> {
    return await this.handleEvent(ctx, handler)
  }
}

describe('Adapter', () => {
  let blueprint: IBlueprint
  let adapter: UnitTestAdapter
  let context: AdapterContext<any, any, any, any, any, any>

  beforeEach(() => {
    blueprint = Config.create()
    blueprint.set('stone.adapter.middleware', [])
    blueprint.set('stone.adapter.eventHandlerResolver', () => () => OutgoingResponse.create({ content: { ok: true } }))
    adapter = UnitTestAdapter.create(blueprint)

    context = {
      rawEvent: {},
      executionContext: {},
      incomingEventBuilder: {
        build: () => IncomingEvent.create({ name: 'unit', source: { platform: 'cli', rawContext: '', rawEvent: '' } })
      } as unknown as IAdapterEventBuilder<IncomingEventOptions, IncomingEvent>,
      rawResponseBuilder: {
        add: vi.fn().mockReturnThis(),
        build: () => new MockResponseWrapper({ name: 'unit' })
      } as unknown as IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<string>>
    }
  })

  describe('sendEventThroughDestination', () => {
    it('sendEventThroughDestination should process the event through pipeline and build response', async () => {
      const handleEventSpy = vi.spyOn(adapter as any, 'handleEvent').mockImplementation(async () => ({
        build: new MockResponseWrapper({ name: 'event-built' })
      }))
      const buildRawResponseSpy = vi.spyOn(adapter as any, 'buildRawResponse').mockImplementation(async () => 'final-response')

      const result = await adapter.simulateSendEvent(context, () => OutgoingResponse.create({ name: 'X' }))

      expect(handleEventSpy).toHaveBeenCalled()
      expect(buildRawResponseSpy).toHaveBeenCalled()
      expect(result).toBe('final-response')
    })

    it('should handle error if pipeline or handler throws (catch path)', async () => {
      const error = new Error('mock-fail')
      const handleErrorSpy = vi.spyOn(adapter as any, 'handleError').mockResolvedValue({
        build: () => new MockResponseWrapper({ name: 'error-handled' })
      })
      const buildResponseSpy = vi.spyOn(adapter as any, 'buildRawResponse').mockResolvedValue('error-response')

      // Simulate failure by mocking handleEvent to throw
      vi.spyOn(adapter as any, 'handleEvent').mockImplementation(() => {
        throw error
      })

      const result = await adapter.simulateSendEvent(context, () => OutgoingResponse.create({ name: 'X' }))

      expect(handleErrorSpy).toHaveBeenCalledWith(error, context)
      expect(buildResponseSpy).toHaveBeenCalled()
      expect(result).toBe('error-response')
    })
  })

  describe('validateContextAndEventHandler', () => {
    it('validateContextAndEventHandler throws for missing handler', () => {
      expect(() => {
        adapter.simulateValidate(context, undefined as any)
      }).toThrow(IntegrationError)
    })

    it('validateContextAndEventHandler throws for missing rawResponseBuilder', () => {
      // @ts-expect-error - missing type
      context.rawResponseBuilder = undefined
      expect(() => {
        adapter.simulateValidate(context, () => OutgoingResponse.create({}))
      }).toThrow(IntegrationError)
    })

    it('validateContextAndEventHandler throws for missing incomingEventBuilder', () => {
      // @ts-expect-error - missing type
      context.rawResponseBuilder = { build: () => {} }
      // @ts-expect-error - missing type
      context.incomingEventBuilder = undefined
      expect(() => {
        adapter.simulateValidate(context, () => OutgoingResponse.create({}))
      }).toThrow(IntegrationError)
    })

    it('validateContextAndEventHandler throws for missing incomingEventBuilder', () => {
      // @ts-expect-error - missing type
      context.rawResponseBuilder = { build: () => {} }
      // @ts-expect-error - missing type
      context.incomingEventBuilder = { build: null }
      expect(() => {
        adapter.simulateValidate(context, () => OutgoingResponse.create({}))
      }).toThrow(IntegrationError)
    })
  })

  describe('resolveEventHandler', () => {
    it('resolveEventHandler throws if missing eventHandlerResolver', () => {
      blueprint.set('stone.adapter.eventHandlerResolver', undefined)
      expect(() => adapter.simulateResolveHandler()).toThrow(IntegrationError)
    })

    it('resolveEventHandler throws if missing eventHandler', () => {
      blueprint.set('stone.adapter.eventHandlerResolver', () => undefined)
      expect(() => adapter.simulateResolveHandler()).toThrow(IntegrationError)
    })

    it('should return the eventHandler', () => {
      blueprint.set('stone.adapter.eventHandlerResolver', () => vi.fn())
      expect(adapter.simulateResolveHandler()).toBeInstanceOf(Function)
    })
  })

  describe('handleEvent', () => {
    it('handleEvent throws if missing incomingEvent', async () => {
      // @ts-expect-error - missing type
      context.incomingEventBuilder = { build: () => undefined }
      // @ts-expect-error - missing type
      await expect(async () => await adapter.simulateHandleEvent(context, {})).rejects.toThrow(IntegrationError)
    })

    it('handleEvent calls function handler and hooks', async () => {
      const handler = vi.fn().mockResolvedValue(OutgoingResponse.create({ success: true }))
      await adapter.simulateHandleEvent(context, handler)
      expect(handler).toHaveBeenCalled()
    })

    it('handleEvent calls class handler and hooks', async () => {
      const spy = vi.fn()
      blueprint.set('stone.lifecycleHooks', {
        onBuildingIncomingEvent: [() => spy()]
      })
      adapter = UnitTestAdapter.create(blueprint)

      const handler = {
        onEventHandled: () => spy(),
        onHandlingEvent: () => spy(),
        handle: vi.fn().mockResolvedValue(OutgoingResponse.create({ success: true }))
      }

      await adapter.simulateHandleEvent(context, handler)
      expect(handler.handle).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(3)
    })
  })

  describe('handleError', () => {
    it('handleError throws if not a valid error handler', async () => {
      blueprint.set('stone.adapter.errorHandlers.default', { module: { handle: () => {} } })
      await expect(async () => await adapter.simulateHandleError(new Error('fail'), context)).rejects.toThrow(IntegrationError)
    })

    it('function-based: handleError delegates to error handler and returns builder', async () => {
      const errorHandler = (): unknown => ({ build: (): MockResponseWrapper => new MockResponseWrapper({ name: 'handled' }) })
      blueprint.set('stone.adapter.errorHandlers.default', {
        module: errorHandler
      })

      const resBuilder = await adapter.simulateHandleError(new Error('fail'), context)
      expect(resBuilder.build().respond()).toBe('wrapped: handled')
    })

    it('factory-based: handleError delegates to error handler and returns builder', async () => {
      const errorHandler = () => () => ({ build: () => new MockResponseWrapper({ name: 'handled' }) })
      blueprint.set('stone.adapter.errorHandlers.default', {
        module: errorHandler,
        isFactory: true
      })

      const resBuilder = await adapter.simulateHandleError(new Error('fail'), context)
      expect(resBuilder.build().respond()).toBe('wrapped: handled')
    })

    it('class-based: handleError delegates to error handler and returns builder', async () => {
      const errorHandler = class {
        handle (): unknown {
          return { build: (): MockResponseWrapper => new MockResponseWrapper({ name: 'handled' }) }
        }
      }
      blueprint.set('stone.adapter.errorHandlers.default', {
        module: errorHandler,
        isClass: true
      })

      const resBuilder = await adapter.simulateHandleError(new Error('fail'), context)
      expect(resBuilder.build().respond()).toBe('wrapped: handled')
    })
  })

  it('executeHooks runs lifecycle listeners', async () => {
    const calls: string[] = []
    blueprint.set('stone.lifecycleHooks', {
      onStart: [() => calls.push('onStart')]
    })
    adapter = UnitTestAdapter.create(blueprint)
    await adapter.simulateHooks('onStart', context)
    expect(calls).toContain('onStart')
  })

  it('buildRawResponse calls respond()', async () => {
    const result = await adapter.simulateBuildRawResponse(context, { handle: vi.fn(), onTerminate: vi.fn() })
    expect(result).toContain('wrapped')
  })

  it('makePipelineOptions returns valid resolver', () => {
    Logger.init(blueprint)
    const factorySpy = vi.fn()
    const constructorSpy = vi.fn()
    const factoryModule = (): any => factorySpy()
    const classModule = class {
      constructor () {
        constructorSpy()
      }
    }
    // @ts-expect-error - private access
    const opts = adapter.makePipelineOptions()
    expect(typeof opts.resolver).toBe('function')
    expect(opts.hooks).toBeDefined()
    opts.resolver?.({ module: classModule, isClass: true })
    expect(constructorSpy).toHaveBeenCalled()
    opts.resolver?.({ module: factoryModule, isFactory: true })
    expect(factorySpy).toHaveBeenCalled()
  })
})
