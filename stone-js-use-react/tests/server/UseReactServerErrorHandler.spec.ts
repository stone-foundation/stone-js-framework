import { renderToString } from 'react-dom/server'
import * as Utils from '../../src/UseReactPageInternals'
import { Logger, AdapterErrorContext, IBlueprint, ILogger } from '@stone-js/core'
import { UseReactServerErrorHandler } from '../../src/server/UseReactServerErrorHandler'

// Mocks
vi.mock('../../src/UseReactPageInternals', () => ({
  htmlTemplate: vi.fn(),
  buildAdapterErrorComponent: vi.fn()
}))
vi.mock('react-dom/server', () => ({
  renderToString: vi.fn()
}))

describe('UseReactServerErrorHandler', () => {
  const loggerError = vi.fn()
  const blueprint = {} as unknown as IBlueprint
  const logger = { error: loggerError } as unknown as ILogger

  beforeEach(() => {
    vi.spyOn(Logger, 'getInstance').mockReturnValue(logger as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createContext = (): AdapterErrorContext<any, any, any> => ({
    rawResponseBuilder: {
      add: vi.fn().mockReturnThis()
    }
  }) as any

  it('should construct with blueprint and logger', () => {
    const handler = new UseReactServerErrorHandler({ blueprint, logger })

    expect(handler).toBeInstanceOf(UseReactServerErrorHandler)
    expect(Logger.getInstance).toHaveBeenCalled()
  })

  it('should handle error and return raw response builder', async () => {
    const context = createContext()
    const handler = new UseReactServerErrorHandler({ blueprint, logger })

    const error = { message: 'Test error', statusCode: 404 }

    // Setup mocks for internal method
    vi.spyOn(handler as any, 'getErrorBody').mockResolvedValue('<div>Error</div>')

    const result = await handler.handle(error, context)

    expect(loggerError).toHaveBeenCalledWith('Test error', { error })
    expect(context.rawResponseBuilder.add).toHaveBeenCalledWith('statusCode', 404)
    expect(context.rawResponseBuilder.add).toHaveBeenCalledWith('headers', expect.any(Headers))
    expect(context.rawResponseBuilder.add).toHaveBeenCalledWith('body', '<div>Error</div>')
    expect(result.add).toBeInstanceOf(Function)
  })

  it('should handle error with default statusCode 500', async () => {
    const context = createContext()
    const handler = new UseReactServerErrorHandler({ blueprint, logger })

    const error = { message: 'Oops' }

    vi.spyOn(handler as any, 'getErrorBody').mockResolvedValue('<html></html>')

    await handler.handle(error, context)

    expect(context.rawResponseBuilder.add).toHaveBeenCalledWith('statusCode', 500)
  })

  it('should return error body with rendered HTML', async () => {
    const context = createContext()
    const handler = new UseReactServerErrorHandler({ blueprint, logger })

    const error = { message: 'Oops' }

    const fakeTemplate = '<html><!--app-html--></html>'
    const fakeComponent = (): any => null
    const rendered = '<div>Rendered</div>'

    vi.mocked(Utils.htmlTemplate).mockReturnValue(fakeTemplate)
    vi.mocked(Utils.buildAdapterErrorComponent).mockResolvedValue(fakeComponent as any)

    vi.mocked(renderToString).mockReturnValue(rendered)

    const result = await (handler as any).getErrorBody(error, context)

    expect(Utils.htmlTemplate).toHaveBeenCalledWith(blueprint)
    expect(Utils.buildAdapterErrorComponent).toHaveBeenCalledWith(blueprint, context, 500, error)
    expect(renderToString).toHaveBeenCalledWith(fakeComponent)
    expect(result).toBe('<html><div>Rendered</div></html>')
  })
})
