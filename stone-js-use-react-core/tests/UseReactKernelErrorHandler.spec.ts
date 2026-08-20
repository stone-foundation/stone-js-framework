import { UseReactKernelErrorHandler } from '../src/UseReactKernelErrorHandler'

describe('UseReactKernelErrorHandler', () => {
  const defaultMeta = { component: 'DefaultPage' }
  const notFoundMeta = { component: 'NotFoundPage' }

  const blueprint = {
    get: vi.fn()
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns matching error page and statusCode', () => {
    const error = new Error('NotFound')
    error.name = 'NotFound'
    // @ts-expect-error
    error.statusCode = 404

    blueprint.get = vi.fn()
      .mockReturnValueOnce(notFoundMeta) // for error.name
      .mockReturnValueOnce(defaultMeta) // fallback (unused)

    const handler = new UseReactKernelErrorHandler({ blueprint })
    const result = handler.handle(error)

    expect(result.statusCode).toBe(404)
    expect(result.content).toEqual({ ...notFoundMeta, error })
    expect(blueprint.get).toHaveBeenCalledWith('stone.useReact.errorPages.NotFound')
  })

  it('falls back to default error metadata', () => {
    const error = new Error('UnknownError')

    blueprint.get = vi.fn()
      .mockReturnValueOnce(undefined) // not found
      .mockReturnValueOnce(defaultMeta) // default fallback

    const handler = new UseReactKernelErrorHandler({ blueprint })
    const result = handler.handle(error)

    expect(result.statusCode).toBe(500)
    expect(result.content).toEqual({ ...defaultMeta, error })
    expect(blueprint.get).toHaveBeenCalledWith('stone.useReact.errorPages.Error')
    expect(blueprint.get).toHaveBeenCalledWith('stone.useReact.errorPages.default', expect.anything())
  })

  it('uses statusCode 500 if missing on error', () => {
    const error = new Error('Oops') // no statusCode

    blueprint.get = vi.fn()
      .mockReturnValueOnce(defaultMeta) // fallback used

    const handler = new UseReactKernelErrorHandler({ blueprint })
    const result = handler.handle(error)

    expect(result.statusCode).toBe(500)
  })
})
