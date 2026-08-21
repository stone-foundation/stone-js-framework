import { IBlueprint, IContainer } from '@stone-js/core'
import { applyFallbackErrorContent, prepareErrorPageParts, preparePageParts } from '../src/PagePreparation'

/**
 * The page pipeline both renderers call, tested where it lives.
 *
 * These assertions are about the order and the result of the shared steps, not about what any
 * renderer does with them: the web one assembles a document, the native one pushes a screen, and
 * neither of those decisions is here.
 */
const makeContext = (blueprintValues: Record<string, any> = {}): {
  container: IContainer
  response: any
  event: any
  logger: { error: ReturnType<typeof vi.fn> }
} => {
  const blueprint = {
    get: vi.fn((key: string, fallback?: any) => blueprintValues[key] ?? fallback)
  } as unknown as IBlueprint
  const event: any = { pathname: '/tasks', fingerprint: () => 'fp', get: vi.fn() }
  const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() }
  const container = {
    make: vi.fn((key: string) => (
      key === 'blueprint' ? blueprint : key === 'event' ? event : key === 'logger' ? logger : undefined
    )),
    resolve: vi.fn((module: any) => new module())
  } as unknown as IContainer
  const response: any = {
    content: {},
    statusCode: 200,
    setContent (content: any) { this.content = content; return this },
    setStatus (statusCode: number) { this.statusCode = statusCode; return this },
    isError: () => false
  }

  return { container, response, event, logger }
}

describe('preparePageParts', () => {
  it('runs the loader and hands both component shapes back', async () => {
    class TasksPage {
      handle (): unknown { return { tasks: ['Ship it'] } }
      render (): string { return 'Tasks' }
    }
    const { container, response, event } = makeContext()
    response.content = { module: TasksPage, isClass: true }

    const parts = await preparePageParts(event, response, container, {} as any)

    expect(parts.data).toEqual({ tasks: ['Ship it'] })
    expect(parts.app).toBeTruthy()
    expect(parts.component).toBeTruthy()
    expect(parts.layout).toBe('default')
  })

  it('merges the layout head under the page head', async () => {
    class LayoutWithHead {
      head (): unknown { return { title: 'From the layout', description: 'from the layout' } }
      render (): string { return 'layout' }
    }
    class TasksPage {
      head (): unknown { return { title: 'My tasks' } }
      render (): string { return 'Tasks' }
    }
    const { container, response, event } = makeContext({
      'stone.useReact.layouts.default': { module: LayoutWithHead, isClass: true }
    })
    response.content = { module: TasksPage, isClass: true }

    const parts = await preparePageParts(event, response, container, {} as any)

    // The page wins on what both declare, the layout still contributes the rest.
    expect(parts.head?.title).toBe('My tasks')
    expect(parts.head?.description).toBe('from the layout')
  })

  it('carries what a hydrating renderer will need to serialize', async () => {
    class TasksPage { render (): string { return 'Tasks' } }
    const { container, response, event } = makeContext()
    response.content = { module: TasksPage, isClass: true, layout: 'admin' }

    const parts = await preparePageParts(event, response, container, {} as any)

    expect(parts.snapshotData).toEqual({ data: undefined, layout: 'admin', statusCode: 200 })
  })

  it('prepares a page that declares neither loader nor head', async () => {
    class BarePage { render (): string { return 'Bare' } }
    const { container, response, event } = makeContext()
    response.content = { module: BarePage, isClass: true }

    const parts = await preparePageParts(event, response, container, {} as any)

    expect(parts.data).toBeUndefined()
    expect(parts.head).toBeUndefined()
    expect(parts.app).toBeTruthy()
  })
})

describe('prepareErrorPageParts', () => {
  it('says out loud that the route failed, with the message and the path', async () => {
    // An error page is a successful-looking response, so nothing else announces the failure. Without
    // this the only trace was `{"name":"TypeError"}` in the snapshot, and a message-less TypeError on
    // a path that never mentions compression cost hours to track down.
    const { container, response, event, logger } = makeContext()
    response.content = { error: new TypeError('response.removeHeader is not a function') }

    await prepareErrorPageParts(event, response, container, {} as any)

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('response.removeHeader is not a function'),
      expect.anything()
    )
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('/tasks'), expect.anything())
  })

  it('keeps the message out of the snapshot, which is sent to the browser', async () => {
    const { container, response, event } = makeContext()
    response.content = { error: new Error('SELECT * FROM users failed at /srv/app/db.ts:42') }

    const parts = await prepareErrorPageParts(event, response, container, {} as any)

    expect(parts.snapshotData.error).toEqual({ name: 'Error' })
  })

  it('puts the message in the snapshot when the application asked to be debugged', async () => {
    const { container, response, event } = makeContext({ 'stone.debug': true })
    response.content = { error: new Error('boom') }

    const parts = await prepareErrorPageParts(event, response, container, {} as any)

    expect(parts.snapshotData.error).toEqual({ name: 'Error', message: 'boom' })
  })

  it('reports something readable even when what threw was not an Error', async () => {
    const { container, response, event, logger } = makeContext()
    response.content = { error: 'a string was thrown' }

    await prepareErrorPageParts(event, response, container, {} as any)

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('a string was thrown'), expect.anything())
  })

  it('still serves the page when there is no logger to tell', async () => {
    // A container that cannot resolve a logger is not a reason to fail a response that was going to
    // be served.
    const { container, response, event } = makeContext()
    const original = container.make as any
    ;(container as any).make = vi.fn((key: string) => (key === 'logger' ? undefined : original(key)))
    response.content = { error: new Error('boom') }

    await expect(prepareErrorPageParts(event, response, container, {} as any)).resolves.toBeDefined()
  })

  it('gives the error to the page, first argument', async () => {
    let seen: any
    class ErrorScreen {
      handle (error: any): unknown { seen = error; return { reason: error.message } }
      render (): string { return 'broke' }
    }
    const { container, response, event } = makeContext()
    const error = new Error('boom')
    response.content = { module: ErrorScreen, isClass: true, error }

    const parts = await prepareErrorPageParts(event, response, container, {} as any)

    expect(seen).toBe(error)
    expect(parts.data).toEqual({ reason: 'boom' })
    expect(parts.snapshotData).toMatchObject({ error: { name: 'Error' } })
  })

  it('renders the fallback the renderer supplied when no page was declared', async () => {
    const Fallback = (): null => null
    const { container, response, event } = makeContext()
    response.content = { error: new Error('boom') }

    const parts = await prepareErrorPageParts(event, response, container, {} as any, Fallback)

    expect(parts.app).toBeTruthy()
  })

  it('still prepares something when there is neither a page nor a fallback', async () => {
    // A native renderer passes no fallback: it has no HTML error page to offer. What comes
    // back is `buildPageComponent`'s empty-page placeholder, which is an HTML `div` and so
    // means nothing on a device. Harmless in practice, since `render` is required by the page
    // contract and a real page always has one, but the placeholder belongs to the renderer
    // rather than to this shared layer. Left as it is here to keep this change about the
    // duplication it set out to remove.
    const { container, response, event } = makeContext()
    response.content = { error: new Error('boom') }

    const parts = await prepareErrorPageParts(event, response, container, {} as any)

    expect(parts.component).toBeTruthy()
    expect(parts.data).toBeUndefined()
  })
})

describe('applyFallbackErrorContent', () => {
  it('puts the page declared for that error name on the response', async () => {
    class TypeErrorScreen { render (): string { return 'bad input' } }
    const { container, response } = makeContext({
      'stone.useReact.errorPages.TypeError': { module: TypeErrorScreen, isClass: true }
    })
    const error = new TypeError('bad input')

    applyFallbackErrorContent(response, container, { error, statusCode: 503 } as any)

    expect(response.statusCode).toBe(503)
    expect(response.content.module).toBe(TypeErrorScreen)
    expect(response.content.error).toBe(error)
  })

  it('falls back to the default page, and to 500', async () => {
    class DefaultScreen { render (): string { return 'unexpected' } }
    const { container, response } = makeContext({
      'stone.useReact.errorPages.default': { module: DefaultScreen, isClass: true }
    })

    applyFallbackErrorContent(response, container, {} as any)

    expect(response.statusCode).toBe(500)
    expect(response.content.module).toBe(DefaultScreen)
  })

  it('takes the error the response was carrying when the snapshot had none', async () => {
    const { container, response } = makeContext()
    const error = new RangeError('out of range')
    response.content = error

    applyFallbackErrorContent(response, container, {} as any)

    expect(response.content.error).toBe(error)
  })

  it('invents an error when neither carried one, because a screen needs one to render', async () => {
    const { container, response } = makeContext()

    applyFallbackErrorContent(response, container, {} as any)

    expect(response.content.error).toBeInstanceOf(Error)
  })
})
