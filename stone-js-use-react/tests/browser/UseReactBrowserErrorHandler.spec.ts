import { Logger } from '@stone-js/core'
import { UseReactBrowserErrorHandler } from '../../src/browser/UseReactBrowserErrorHandler'
import { renderReactApp } from '../../src/UseReactPageInternals'
import { buildAdapterErrorComponent } from '@stone-js/use-react-core'

vi.mock('@stone-js/use-react-core', async (mod) => ({
  ...(await mod() as any),
  buildAdapterErrorComponent: vi.fn()
}))
vi.mock('../../src/UseReactPageInternals', async (mod) => ({
  ...(await mod() as any),
  renderReactApp: vi.fn()
}))

describe('UseReactBrowserErrorHandler', () => {
  const blueprint: any = { get: vi.fn() } as any
  const error: any = new Error('Something went wrong')
  error.statusCode = 500

  let context: any

  beforeEach(() => {
    vi.clearAllMocks()

    context = {
      rawResponseBuilder: {
        add: vi.fn().mockReturnThis()
      }
    }
  })

  it('logs error and adds render function to builder', async () => {
    const logger = { error: vi.fn() }
    Logger.getInstance = vi.fn().mockReturnValue(logger)

    const handler = new UseReactBrowserErrorHandler({ blueprint })

    const result = await handler.handle(error, context)

    expect(logger.error).toHaveBeenCalledWith(error.message, { error })
    expect(context.rawResponseBuilder.add).toHaveBeenCalledWith('render', expect.any(Function))
    expect(result).toBe(context.rawResponseBuilder)
  })

  it('calls buildAdapterErrorComponent and renderReactApp inside render()', async () => {
    const App = (): string => 'ErrorComponent'
    error.statusCode = undefined

    // @ts-expect-error
    vi.mocked(buildAdapterErrorComponent).mockResolvedValue(App)
    // @ts-expect-error
    vi.mocked(renderReactApp).mockReturnValue(undefined)

    const handler = new UseReactBrowserErrorHandler({ blueprint })
    const builder = await handler.handle(error, context)

    const renderFn = context.rawResponseBuilder.add.mock.calls[0][1]
    await renderFn() // run the async render

    expect(buildAdapterErrorComponent).toHaveBeenCalledWith(blueprint, context, 500, error)
    expect(renderReactApp).toHaveBeenCalledWith(App, blueprint)
    expect(builder).toBe(context.rawResponseBuilder)
  })
})
