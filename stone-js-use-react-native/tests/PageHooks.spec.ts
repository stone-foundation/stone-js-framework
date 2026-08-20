import { IContainer } from '@stone-js/core'
import { onPreparingResponse } from '../src/PageHooks'
import * as renderer from '../src/PageRenderer'

vi.mock('../src/PageRenderer', () => ({
  preparePage: vi.fn(),
  prepareErrorPage: vi.fn(),
  prepareFallbackErrorPage: vi.fn()
}))

vi.mock('@stone-js/use-react-core', async (mod) => ({
  ...(await mod() as any),
  getResponseSnapshot: vi.fn()
}))

const { getResponseSnapshot } = await import('@stone-js/use-react-core')

/**
 * Which of the three renderers answers, and in which order the cases are decided. The order
 * is the point: an error carried on the snapshot means nothing ever got to answer, so it wins
 * over a response that merely reports an error.
 */
describe('onPreparingResponse', () => {
  const container = {} as unknown as IContainer
  const event: any = { pathname: '/tasks' }

  beforeEach(() => { vi.clearAllMocks() })

  it('renders the fallback screen when the snapshot carries an error', async () => {
    vi.mocked(getResponseSnapshot).mockReturnValue({ error: new Error('early') } as any)

    await onPreparingResponse({ event, container, response: { isError: () => true } as any })

    expect(renderer.prepareFallbackErrorPage).toHaveBeenCalled()
    expect(renderer.prepareErrorPage).not.toHaveBeenCalled()
  })

  it('renders the error screen when the response is an error', async () => {
    vi.mocked(getResponseSnapshot).mockReturnValue({} as any)

    await onPreparingResponse({ event, container, response: { isError: () => true } as any })

    expect(renderer.prepareErrorPage).toHaveBeenCalled()
  })

  it('renders the page when the response carries one', async () => {
    vi.mocked(getResponseSnapshot).mockReturnValue({} as any)

    await onPreparingResponse({
      event,
      container,
      response: { isError: () => false, content: { module: () => {} } } as any
    })

    expect(renderer.preparePage).toHaveBeenCalled()
  })

  it('leaves a plain response alone, so a handler returning data still works', async () => {
    vi.mocked(getResponseSnapshot).mockReturnValue({} as any)

    await onPreparingResponse({
      event,
      container,
      response: { isError: () => false, content: { tasks: [] } } as any
    })

    expect(renderer.preparePage).not.toHaveBeenCalled()
    expect(renderer.prepareErrorPage).not.toHaveBeenCalled()
    expect(renderer.prepareFallbackErrorPage).not.toHaveBeenCalled()
  })
})
