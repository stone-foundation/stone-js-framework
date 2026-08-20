import { IBlueprint, IContainer } from '@stone-js/core'
import { prepareFallbackErrorPage } from '../src/PageRenderer'

/**
 * The path taken when nothing ever got to answer: the kernel failed early and the error is
 * carried on the snapshot rather than on a response. It cannot be reached by navigating, so
 * it is exercised directly.
 */
describe('prepareFallbackErrorPage', () => {
  const makeContext = (blueprintValues: Record<string, any> = {}): {
    container: IContainer
    response: any
    event: any
  } => {
    const blueprint = {
      get: vi.fn((key: string, fallback?: any) => blueprintValues[key] ?? fallback)
    } as unknown as IBlueprint
    const event: any = { pathname: '/tasks', fingerprint: () => 'fp', get: vi.fn() }
    const container = {
      make: vi.fn((key: string) => (key === 'blueprint' ? blueprint : key === 'event' ? event : undefined)),
      resolve: vi.fn((module: any) => new module())
    } as unknown as IContainer
    const response: any = {
      content: undefined,
      statusCode: undefined,
      setContent (content: any) { this.content = content; return this },
      setStatus (statusCode: number) { this.statusCode = statusCode; return this },
      isError: () => true
    }

    return { container, response, event }
  }

  it('renders the declared error screen with the error the snapshot carried', async () => {
    class ErrorScreen {
      render ({ error }: any): string { return `broke: ${String(error?.name)}` }
    }
    const { container, response, event } = makeContext({
      'stone.useReact.errorPages.TypeError': { module: ErrorScreen, isClass: true }
    })
    const error = new TypeError('bad input')

    await prepareFallbackErrorPage(event, response, container, { error, statusCode: 500 } as any)

    expect(response.statusCode).toBe(500)
    expect(response.content.path).toBe('/tasks')
    expect(response.content.app).toBeTruthy()
  })

  it('invents an error when neither the snapshot nor the response carried one', async () => {
    class ErrorScreen {
      render (): string { return 'broke' }
    }
    const { container, response, event } = makeContext({
      'stone.useReact.errorPages.default': { module: ErrorScreen, isClass: true }
    })

    await prepareFallbackErrorPage(event, response, container, {} as any)

    // Defaults to 500: a native application still has to show something, and the screen
    // needs an error to render.
    expect(response.statusCode).toBe(500)
    expect(response.content.app).toBeTruthy()
  })

  it('uses the error the response was carrying when the snapshot had none', async () => {
    class ErrorScreen {
      render (): string { return 'broke' }
    }
    const { container, response, event } = makeContext({
      'stone.useReact.errorPages.default': { module: ErrorScreen, isClass: true }
    })
    response.content = new RangeError('out of range')

    await prepareFallbackErrorPage(event, response, container, { statusCode: 503 } as any)

    expect(response.statusCode).toBe(503)
  })

  it('renders an error screen that declares no head', async () => {
    class BareErrorScreen {
      render (): string { return 'broke' }
    }
    const { container, response, event } = makeContext({
      'stone.useReact.errorPages.default': { module: BareErrorScreen, isClass: true }
    })

    await prepareFallbackErrorPage(event, response, container, { error: new Error('x') } as any)

    expect(response.content.head).toBeUndefined()
  })
})
