import { Mock } from 'vitest'
import { IBlueprint, OutgoingResponse, AdapterErrorContext, ILogger, addBlueprint } from '@stone-js/core'
import { AWS_APIGW_WS_PLATFORM } from '../src/constants'
import { RawResponseWrapper } from '../src/RawResponseWrapper'
import { apiGatewayWsAdapterResolver } from '../src/resolvers'
import { ApiGatewayWsAdapter } from '../src/ApiGatewayWsAdapter'
import { ApiGatewayWsErrorHandler } from '../src/ApiGatewayWsErrorHandler'
import { ApiGatewayWs, ApiGatewayWsOptions } from '../src/decorators/ApiGatewayWs'
import { ApiGatewayWsAdapterError } from '../src/errors/ApiGatewayWsAdapterError'
import { IncomingEventMiddleware } from '../src/middleware/IncomingEventMiddleware'
import { apiGatewayWsAdapterBlueprint } from '../src/options/ApiGatewayWsAdapterBlueprint'
import {
  metaAdapterBlueprintMiddleware,
  SetApiGatewayWsResponseResolverMiddleware
} from '../src/middleware/BlueprintMiddleware'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: (fn: Function) => { fn(); return fn }
  }
})

describe('RawResponseWrapper', () => {
  it('returns the options it was created with', () => {
    expect(RawResponseWrapper.create({ statusCode: 200 } as any).respond()).toEqual({ statusCode: 200 })
  })
})

describe('apiGatewayWsAdapterResolver', () => {
  it('creates an adapter instance', () => {
    const blueprint = { get: vi.fn((_k: string, d: any) => d) } as unknown as IBlueprint
    expect(apiGatewayWsAdapterResolver(blueprint)).toBeInstanceOf(ApiGatewayWsAdapter)
  })
})

describe('ApiGatewayWsErrorHandler', () => {
  it('logs the error and builds a 500 response', () => {
    const logger = { error: vi.fn() } as unknown as ILogger
    const blueprint = { get: () => () => logger } as unknown as IBlueprint
    const context = { rawResponseBuilder: { add: vi.fn().mockReturnThis() } } as unknown as AdapterErrorContext<any, any, any>
    new ApiGatewayWsErrorHandler({ blueprint }).handle(new Error('boom'), context)
    expect(logger.error).toHaveBeenCalledWith('boom', { error: expect.any(Error) })
    expect(context.rawResponseBuilder.add).toHaveBeenCalledWith('statusCode', 500)
  })
})

describe('SetApiGatewayWsResponseResolverMiddleware', () => {
  it('sets the response resolver for the aws_apigw_ws platform', async () => {
    const next = vi.fn().mockResolvedValue('done')
    const blueprint = { get: vi.fn().mockReturnValue(AWS_APIGW_WS_PLATFORM), set: vi.fn() }
    await SetApiGatewayWsResponseResolverMiddleware({ blueprint } as any, next)
    expect(blueprint.set).toHaveBeenCalledWith('stone.kernel.responseResolver', expect.any(Function))
    expect(blueprint.set.mock.calls[0][1]({ statusCode: 200 })).toBeInstanceOf(OutgoingResponse)
  })

  it('does nothing for another platform', async () => {
    const next = vi.fn().mockResolvedValue('done')
    const blueprint = { get: vi.fn().mockReturnValue('other'), set: vi.fn() }
    await SetApiGatewayWsResponseResolverMiddleware({ blueprint } as any, next)
    expect(blueprint.set).not.toHaveBeenCalled()
  })

  it('exports the ordered middleware list', () => {
    expect(metaAdapterBlueprintMiddleware).toEqual([{ module: SetApiGatewayWsResponseResolverMiddleware, priority: 6 }])
  })
})

describe('IncomingEventMiddleware', () => {
  const context = (): any => ({
    rawEvent: { requestContext: { connectionId: 'c1', eventType: 'MESSAGE' } },
    executionContext: {},
    incomingEventBuilder: { add: vi.fn().mockReturnThis() }
  })

  it('adds metadata and source, then calls next', async () => {
    const ctx = context()
    const next = vi.fn().mockResolvedValue('ok')
    await new IncomingEventMiddleware().handle(ctx, next)
    expect(ctx.incomingEventBuilder.add).toHaveBeenCalledWith('metadata', ctx.rawEvent)
    expect(ctx.incomingEventBuilder.add).toHaveBeenCalledWith('source', expect.objectContaining({ platform: AWS_APIGW_WS_PLATFORM }))
    expect(next).toHaveBeenCalledWith(ctx)
  })

  it('throws when the context is missing required components', async () => {
    const middleware = new IncomingEventMiddleware()
    await expect(middleware.handle({ rawEvent: undefined } as any, vi.fn())).rejects.toThrow(ApiGatewayWsAdapterError)
    await expect(middleware.handle({ rawEvent: {}, incomingEventBuilder: undefined } as any, vi.fn())).rejects.toThrow(ApiGatewayWsAdapterError)
  })
})

describe('ApiGatewayWs decorator', () => {
  it('applies the blueprint with options', () => {
    (addBlueprint as Mock).mockReturnValueOnce(() => {})
    const options: ApiGatewayWsOptions = apiGatewayWsAdapterBlueprint.stone.adapters?.[0] ?? {}
    ApiGatewayWs(options)(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })

  it('applies the default blueprint when no options are given', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    ApiGatewayWs()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
