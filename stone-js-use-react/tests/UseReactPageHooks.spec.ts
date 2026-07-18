import { onPreparingResponse } from '../src/UseReactPageHooks'
import { getResponseSnapshot } from '../src/UseReactPageInternals'
import { prepareFallbackErrorPage, prepareErrorPage, preparePage } from '../src/UseReactPageRenderer'

// 1. Mock first!
vi.mock('../src/UseReactPageRenderer', () => ({
  preparePage: vi.fn(),
  prepareErrorPage: vi.fn(),
  prepareFallbackErrorPage: vi.fn()
}))

vi.mock('../src/UseReactPageInternals', () => ({
  getResponseSnapshot: vi.fn()
}))

describe('onPreparingResponse', () => {
  let response: any
  const container = { make: vi.fn() } as any
  const event = { fingerprint: vi.fn().mockReturnValue('fingerprint') } as any

  beforeEach(() => {
    response = {
      isError: vi.fn(),
      content: {},
      setContent: vi.fn(),
      setStatus: vi.fn()
    }

    vi.mocked(getResponseSnapshot).mockReturnValue({ ssr: false })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('calls prepareFallbackErrorPage if snapshot.error is present', async () => {
    const snapshot = { error: new Error('Boom!'), ssr: false }
    vi.mocked(getResponseSnapshot).mockReturnValue(snapshot)

    await onPreparingResponse({ container, event, response })

    expect(prepareFallbackErrorPage).toHaveBeenCalledWith(event, response, container, snapshot)
  })

  it('calls prepareErrorPage if response.isError() is true', async () => {
    response.isError.mockReturnValue(true)

    await onPreparingResponse({ container, event, response })

    expect(prepareErrorPage).toHaveBeenCalledWith(event, response, container, expect.any(Object))
  })

  it('calls preparePage if response.content.module is a function', async () => {
    response.isError.mockReturnValue(false)
    response.content.module = () => {}

    await onPreparingResponse({ container, event, response })

    expect(preparePage).toHaveBeenCalledWith(event, response, container, expect.any(Object))
  })

  it('does nothing if no condition matches', async () => {
    response.isError.mockReturnValue(false)
    response.content = {}

    await onPreparingResponse({ container, event, response })

    expect(prepareFallbackErrorPage).not.toHaveBeenCalled()
    expect(prepareErrorPage).not.toHaveBeenCalled()
    expect(preparePage).not.toHaveBeenCalled()
  })
})
