import { IncomingEvent } from '../src/events/IncomingEvent'
import { IErrorHandler, ResponseResolverOptions } from '../src/declarations'

/**
 * The error-handler contract accepts what the kernel actually consumes.
 *
 * A handler is expected to return response *options* that the kernel hands to its
 * `responseResolver`. The contract used to demand a fully built response type, so the framework
 * cast its own `RouterErrorHandler` and every consumer had to reproduce that cast. These are
 * compile-time assertions: the file failing to typecheck is the failure.
 */
describe('IErrorHandler contract', () => {
  it('accepts a handler returning plain response options, with no cast', () => {
    const handler: IErrorHandler<IncomingEvent> = {
      handle: () => ({ statusCode: 404, content: 'Not Found' })
    }

    expect(handler.handle(new Error('x'), IncomingEvent.create({ source: {} as any }))).toEqual({
      statusCode: 404,
      content: 'Not Found'
    })
  })

  it('accepts an async handler returning response options', async () => {
    const handler: IErrorHandler<IncomingEvent> = {
      handle: async (): Promise<ResponseResolverOptions> => ({ statusCode: 500, content: 'Boom' })
    }

    await expect(handler.handle(new Error('x'), IncomingEvent.create({ source: {} as any })))
      .resolves.toEqual({ statusCode: 500, content: 'Boom' })
  })

  it('still accepts a handler returning the response type itself', () => {
    const built = { statusCode: 204, isBuilt: true }
    const handler: IErrorHandler<IncomingEvent, typeof built> = {
      handle: () => built
    }

    expect(handler.handle(new Error('x'), IncomingEvent.create({ source: {} as any }))).toBe(built)
  })
})
