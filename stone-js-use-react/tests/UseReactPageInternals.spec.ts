import { ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import { StonePage } from '../src/components/StonePage'
import { StoneError } from '../src/components/StoneError'
import { UseReactError } from '../src/errors/UseReactError'
import { applyHeadToHtml } from '@stone-js/use-view'
import { buildAdapterErrorComponent, buildAppComponent, buildLayoutComponent, buildPageComponent, executeHandler, executeHooks, getAppRootElement, getBrowserContent, getResponseSnapshot, getServerContent, htmlTemplate, hydrateReactApp, isClient, isServer, isSSR, renderReactApp, renderStoneSnapshot, resolveComponent, resolveLazyComponent, snapshotResponse } from '../src/UseReactPageInternals'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('react-dom/client', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    hydrateRoot: vi.fn(() => ({ id: 'hydrated-root' })),
    createRoot: vi.fn(() => ({
      render: vi.fn()
    }))
  }
})

vi.mock('react-dom/server', () => ({
  renderToString: vi.fn().mockReturnValue('<div>SSR Content</div>')
}))

vi.mock('@stone-js/use-view', async (importOriginal) => ({
  ...(await importOriginal()),
  applyHeadToHtml: vi.fn((head, template) => {
    return template.replace('<!--app-html-->', '').replace('<!--app-head-->', '')
  })
}))

describe('buildAppComponent', () => {
  it('renders page inside and wraps in <StonePage>', async () => {
    const event = {} as any

    const container: any = {
      make: vi.fn().mockReturnValue({
        get: vi.fn().mockReturnValue({})
      })
    }

    const PageComponent = (): string => 'Page'

    const data = { msg: 'hello' }
    const component = PageComponent

    const result = await buildAppComponent(event, container, component, undefined, data) as ReactElement<any, any>

    expect(result.type).toBe(StonePage)
    expect(result.props.children.type).toBe(PageComponent)
    expect(result.props.context).toEqual({ event, container, data })
  })

  it('renders layout with page inside and wraps in <StonePage>', async () => {
    const event = {} as any
    const Layout = (props: any): string => `Layout(${String(props.children)})`
    const pageLayout = (): any => ({ render: Layout })

    const container: any = {
      make: vi.fn().mockReturnValue({
        get: vi.fn().mockReturnValue({ module: pageLayout, isFactory: true })
      })
    }

    const PageComponent = (): string => 'Page'

    const layout = 'default'
    const data = { msg: 'hello' }
    const component = PageComponent

    const result = await buildAppComponent(event, container, component, layout, data) as ReactElement<any, any>

    expect(result.type).toBe(StonePage)
    expect(result.props.children.type({ children: PageComponent })).toBe(Layout({ children: PageComponent }))
    expect(result.props.context).toEqual({ event, container, data })
    expect(result.props.children.props.children.type).toBe(PageComponent)
  })
})

describe('buildLayoutComponent', () => {
  it('returns undefined if no layout is found', async () => {
    const container: any = {
      make: vi.fn().mockReturnValue({
        get: vi.fn().mockReturnValue(undefined)
      })
    }

    const layout = await buildLayoutComponent(container, 'CHILDREN', 'unknown')
    expect(layout).toBeUndefined()
  })

  // it('renders layout component with children', async () => {
  //   const Layout = vi.fn((props: any) => `Layout(${props.children})`)
  //   const handler = { render: vi.fn().mockReturnValue(Layout) }

  //   const container = {
  //     make: vi.fn().mockReturnValue({
  //       get: vi.fn().mockReturnValue({ module: Layout })
  //     }),
  //     resolve: vi.fn().mockReturnValue(handler)
  //   }

  //   const layout = await buildLayoutComponent(container as any, 'CHILDREN', 'main') as ReactElement<any, any>
  //   // expect(layout?.type).toBe(Layout)
  //   expect(layout?.props.children).toBe('CHILDREN')
  //   expect(layout?.props['data-layout']).toBe('main')
  // })
})

describe('buildPageComponent', () => {
  const event: any = { type: 'browser' }
  const container = {}
  const data = { msg: 'ok' }
  const error = { code: 500 }

  it('renders provided component with props', () => {
    const PageComponent = vi.fn(() => 'Page')

    const result = buildPageComponent(event, container as any, PageComponent, data, 200, error) as ReactElement<any, any>
    expect(result.type).toBe(PageComponent)
    expect(result.props).toEqual({ event, container, data, statusCode: 200, error })
  })

  it('returns empty div if no component is passed', () => {
    const result = buildPageComponent(event, container as any) as ReactElement<any, any>
    expect(result.type).toBe('div')
  })
})

describe('buildAdapterErrorComponent', () => {
  let blueprint: any
  let context: any
  const error = new Error('Oops')
  const statusCode = 500

  beforeEach(() => {
    context = { rawResponseBuilder: { add: vi.fn() } }
  })

  it('returns full layout with component as children (factory modules)', async () => {
    const handler = {
      handle: vi.fn(),
      render: () => 'ErrorComponent'
    }
    const layoutHandler = {
      render: () => 'LayoutComponent'
    }

    const handlerMeta = {
      lazy: false,
      isFactory: true,
      module: () => handler
    }
    const layoutMeta = {
      lazy: false,
      isFactory: true,
      module: () => layoutHandler
    }

    blueprint = {
      get: vi.fn()
        .mockReturnValueOnce(handlerMeta) // error handler
        .mockReturnValueOnce(layoutMeta) // layout handler
    }

    const result = await buildAdapterErrorComponent(blueprint, context, statusCode, error) as ReactElement<any, any>

    expect(result?.type()).toBe(layoutHandler.render())
    expect(result?.props.children.type()).toBe(handler.render())
  })

  it('returns full layout with component as children (class modules)', async () => {
    class Handler {
      handle = vi.fn()
      render = (): string => 'ErrorComponent'
    }

    class LayoutHandler {
      render = (): string => 'LayoutComponent'
    }

    const handlerMeta = {
      lazy: false,
      isClass: true,
      module: Handler
    }
    const layoutMeta = {
      lazy: false,
      isClass: true,
      module: LayoutHandler
    }

    // @ts-expect-error
    error.name = undefined

    blueprint = {
      get: vi.fn()
        .mockReturnValueOnce(handlerMeta) // error handler
        .mockReturnValueOnce(layoutMeta) // layout handler
    }

    const result = await buildAdapterErrorComponent(blueprint, context, statusCode, error) as ReactElement<any, any>

    expect(result?.type()).toBe(new LayoutHandler().render())
    expect(result?.props.children.type()).toBe(new Handler().render())
  })

  it('returns component alone if layout is missing', async () => {
    class Handler {
      handle = vi.fn()
      render = (): string => 'ErrorComponent'
    }

    const handlerMeta = {
      lazy: false,
      isClass: true,
      module: Handler
    }

    blueprint = {
      get: vi.fn()
        .mockReturnValueOnce(handlerMeta) // error handler
        .mockReturnValueOnce(undefined) // layout handler not found
    }

    const result = await buildAdapterErrorComponent(blueprint, context, statusCode, error) as ReactElement<any, any>

    expect(result?.type()).toBe(new Handler().render())
  })

  it('returns StoneError if nothing found', async () => {
    blueprint = {
      get: vi.fn().mockReturnValue(undefined)
    }

    const result = await buildAdapterErrorComponent(blueprint, context, statusCode, error) as ReactElement<any, any>

    expect(result?.type).toBe(StoneError)
    expect(result?.props).toEqual({ blueprint, error, statusCode })
  })

  // it('calls handler.handle if defined', async () => {
  //   const handler = {
  //     render: vi.fn(),
  //     handle: vi.fn()
  //   }
  //   const handlerMeta = {
  //     module: function () {},
  //     lazy: false
  //   }
  //   handlerMeta.module.prototype = { constructor: vi.fn(() => handler) }

  //   blueprint = {
  //     get: vi.fn()
  //       .mockReturnValueOnce(handlerMeta) // error handler
  //       .mockReturnValueOnce(undefined)   // layout
  //   }

  //   await buildAdapterErrorComponent(blueprint, context, statusCode, error)
  //   expect(handler.handle).toHaveBeenCalledWith(error, context)
  // })
})

describe('resolveLazyComponent', () => {
  it('resolves lazy modules without mutating the shared meta object', async () => {
    const resolved = { foo: 'bar' }
    const factory = vi.fn().mockResolvedValue(resolved)

    const meta = {
      lazy: true,
      module: factory
    }

    const result = await resolveLazyComponent(meta)

    // The result is a fresh, fully-resolved meta...
    expect(result).not.toBe(meta)
    expect(result?.lazy).toBe(false)
    expect(result?.module).toBe(resolved)

    // ...and the shared (blueprint-owned) meta is left untouched (no cross-request race).
    expect(meta.lazy).toBe(true)
    expect(meta.module).toBe(factory)
  })

  it('memoizes resolution so the import factory runs once across calls', async () => {
    const resolved = { foo: 'bar' }
    const factory = vi.fn().mockResolvedValue(resolved)
    const meta = { lazy: true, module: factory }

    const first = await resolveLazyComponent(meta)
    const second = await resolveLazyComponent(meta)

    expect(factory).toHaveBeenCalledTimes(1)
    expect(first?.module).toBe(resolved)
    expect(second?.module).toBe(resolved)
  })

  it('returns original if not lazy', async () => {
    const meta = {
      lazy: false,
      module: vi.fn()
    }

    const result = await resolveLazyComponent(meta)

    expect(result).toBe(meta)
  })
})

describe('resolveComponent', () => {
  let container: any

  beforeEach(() => {
    container = {
      resolve: vi.fn()
    }
  })

  it('resolves a class-based meta module', async () => {
    const PageClass: any = class {}
    const meta = {
      lazy: false,
      isClass: true,
      module: PageClass
    }

    container.resolve.mockReturnValue(new PageClass())

    const result = await resolveComponent(container, meta)

    expect(result).toBeInstanceOf(PageClass)
    expect(container.resolve).toHaveBeenCalledWith(PageClass)
  })

  it('resolves a factory-based meta module', async () => {
    const factoryFn: any = vi.fn().mockReturnValue('FactoryInstance')

    const meta = {
      lazy: false,
      isFactory: true,
      module: factoryFn
    }

    const result = await resolveComponent(container, meta)

    expect(result).toBe('FactoryInstance')
  })

  it('returns undefined if format not supported', async () => {
    const meta = {
      lazy: false,
      module: {}
    }

    const result = await resolveComponent(container, meta as any)

    expect(result).toBeUndefined()
  })
})

describe('getAppRootElement', () => {
  it('returns the DOM element by id', () => {
    const blueprint = {
      get: vi.fn().mockReturnValue('app-root')
    }
    const rootElement = document.createElement('div')
    rootElement.id = 'app-root'
    document.body.appendChild(rootElement)

    const el = getAppRootElement(blueprint as any)
    expect(el).toBeInstanceOf(HTMLElement)
    expect(el.id).toBe('app-root')
  })

  it('throws UseReactError if element not found', () => {
    const blueprint = {
      get: vi.fn().mockReturnValue('missing-root')
    }

    expect(() => getAppRootElement(blueprint as any)).toThrow(UseReactError)
  })
})

describe('renderReactApp', () => {
  const app = 'MyApp'

  it('uses existing root from blueprint if defined', () => {
    const render = vi.fn()
    const root = { render }

    const blueprint = {
      get: vi.fn().mockReturnValue(root),
      setIf: vi.fn()
    }

    const result = renderReactApp(app, blueprint as any)

    expect(render).toHaveBeenCalledWith(app)
    expect(result).toBe(root)
  })

  it('creates and stores root if not defined', () => {
    const root = { render: vi.fn() }
    const rootElement = document.createElement('div')
    rootElement.id = 'app-root'
    document.body.appendChild(rootElement)

    const blueprint = {
      get: vi.fn(v => v === 'stone.useReact.reactRoot' ? undefined : 'app-root'),
      setIf: vi.fn()
    }

    vi.mocked(createRoot).mockReturnValue(root as any)

    const result = renderReactApp(app, blueprint as any)

    expect(root.render).toHaveBeenCalledWith(app)
    expect(blueprint.setIf).toHaveBeenCalledWith('stone.useReact.reactRoot', result)
  })
})

describe('hydrateReactApp', () => {
  it('hydrates the app and stores root in blueprint', () => {
    const rootElement = document.createElement('div')
    rootElement.id = 'app-root'
    document.body.appendChild(rootElement)

    const blueprint: any = {
      setIf: vi.fn(),
      get: vi.fn(v => 'app-root')
    }

    const result: any = hydrateReactApp('App', blueprint)

    expect(result.id).toBe('hydrated-root')
    expect(blueprint.setIf).toHaveBeenCalledWith('stone.useReact.reactRoot', result)
  })
})

describe('environment detection', () => {
  const originalWindow = global.window

  afterEach(() => {
    global.window = originalWindow
  })

  describe('isServer', () => {
    it('returns true when window is undefined', () => {
      // @ts-expect-error
      delete global.window
      expect(isServer()).toBe(true)
    })

    it('returns false when window is defined', () => {
      global.window = {} as any
      expect(isServer()).toBe(false)
    })
  })

  describe('isClient', () => {
    it('returns false when server', () => {
      // @ts-expect-error
      delete global.window
      expect(isClient()).toBe(false)
    })

    it('returns true when client', () => {
      global.window = {} as any
      expect(isClient()).toBe(true)
    })
  })

  describe('isSSR', () => {
    it('returns true when window is undefined', () => {
      // @ts-expect-error
      delete global.window
      expect(isSSR()).toBe(true)
    })

    it('returns false when window is defined', () => {
      global.window = {} as any
      expect(isSSR()).toBe(false)
    })
  })
})

describe('htmlTemplate', () => {
  it('should throw an exception when the template is not defined', () => {
    const blueprint: any = {
      get: vi.fn().mockReturnValue(undefined)
    }
    expect(() => htmlTemplate(blueprint)).toThrow(UseReactError)
  })
})

describe('getServerContent', () => {
  it('renders SSR HTML with app and snapshot', () => {
    const container = {
      make: vi.fn().mockReturnValue({
        add: vi.fn().mockReturnThis(),
        get: vi.fn().mockReturnValue('<html><!--app-html--><!--app-head--></html>'),
        toJson: vi.fn().mockReturnValue('{"ssr":true}')
      })
    }

    const event = { fingerprint: vi.fn().mockReturnValue('fp') }
    const component = '<App />'
    const data = { statusCode: 200, data: 'page' }

    vi.mocked(applyHeadToHtml).mockReturnValue(`
      <html><!--app-html--><!--app-head--></html>
    `)

    const result = getServerContent(
      component as any,
      data,
      container as any,
      event as any,
      undefined
    )

    expect(result).toContain('<script id="__STONE_SNAPSHOT__" type="application/json">')
    expect(result).toContain('</html>')
  })
})

describe('getBrowserContent', () => {
  it('toggles fullRender based on layout change', () => {
    const app = 'App'
    const component = 'Comp'
    const layout = 'main'
    const snapshot = { ssr: false }

    const result = getBrowserContent(app, component, layout, snapshot)

    expect(result).toEqual({
      head: undefined,
      app,
      component,
      fullRender: true,
      ssr: false
    })

    // Second time with same layout should set fullRender: false
    const result2 = getBrowserContent(app, component, layout, snapshot)

    expect(result2.fullRender).toBe(false)
  })
})

describe('snapshotResponse', () => {
  it('adds fingerprinted response to snapshot and renders', () => {
    const add = vi.fn().mockReturnValue({
      toJson: vi.fn().mockReturnValue('{"hello":"world"}')
    })

    const snapshot = { add }
    const container = {
      make: vi.fn().mockReturnValue(snapshot)
    }

    const event = {
      fingerprint: vi.fn().mockReturnValue('fp')
    }

    const result = snapshotResponse(event as any, container as any, { foo: 'bar' } as any)

    expect(result).toContain('<script id="__STONE_SNAPSHOT__" type="application/json">')
    expect(result).toContain('"hello":"world"')
  })
})

describe('renderStoneSnapshot', () => {
  it('wraps snapshot JSON in script tag', () => {
    const json = '{"ssr":true}'
    const html = renderStoneSnapshot(json)

    expect(html).toBe('<script id="__STONE_SNAPSHOT__" type="application/json">{"ssr":true}</script>')
  })

  it('escapes </script> in the snapshot so it cannot break out of the tag (XSS)', () => {
    const json = JSON.stringify({ ssr: true, bio: '</script><script>alert(1)</script>' })
    const html = renderStoneSnapshot(json)

    // Exactly one closing tag: the payload did not create a second </script>.
    expect(html.match(/<\/script>/g)).toHaveLength(1)
    expect(html).toContain('\\u003C/script')
  })
})

describe('getResponseSnapshot', () => {
  it('returns snapshot from container with fingerprint', () => {
    const snapshot = { ssr: false }
    const container = {
      make: vi.fn().mockReturnValue({
        get: vi.fn().mockReturnValue(snapshot)
      })
    }

    const event = { fingerprint: vi.fn().mockReturnValue('fp') }

    const result = getResponseSnapshot(event as any, container as any)
    expect(result).toBe(snapshot)
  })
})

describe('executeHandler', () => {
  let response: any
  let snapshot: any
  const event = {} as any

  beforeEach(() => {
    response = {
      setStatus: vi.fn(),
      setHeaders: vi.fn()
    }
    snapshot = { ssr: false }
  })

  it('returns undefined when no error nor handler are defined', async () => {
    snapshot = { data: 'static' }

    const result = await executeHandler(event, response, snapshot)
    expect(result).toBeUndefined()
  })

  it('returns snapshot directly in SSR mode', async () => {
    snapshot = { ssr: true, data: 'static' }

    const result = await executeHandler(event, response, snapshot)
    expect(result).toBe('static')
  })

  it('calls page.handle(event) on client', async () => {
    const handler = {
      handle: vi.fn().mockResolvedValue({ data: 'fromPage' })
    }

    const result = await executeHandler(event, response, snapshot, handler as any)
    expect(handler.handle).toHaveBeenCalledWith(event)
    expect(result).toBe('fromPage')
  })

  it('calls errorPage.handle(error, event)', async () => {
    const error = new Error('Oops')
    const handler = {
      handle: vi.fn().mockResolvedValue({ content: 'fallback' })
    }

    const result = await executeHandler(event, response, snapshot, handler as any, error)
    expect(handler.handle).toHaveBeenCalledWith(error, event)
    expect(result).toBe('fallback')
  })

  it('sets status and headers if provided', async () => {
    const handler = {
      handle: vi.fn().mockResolvedValue({
        statusCode: 404,
        headers: { 'X-Custom': 'yes' },
        content: 'data'
      })
    }

    const result = await executeHandler(event, response, snapshot, handler as any)
    expect(response.setStatus).toHaveBeenCalledWith(404)
    expect(response.setHeaders).toHaveBeenCalledWith({ 'X-Custom': 'yes' })
    expect(result).toBe('data')
  })
})

describe('executeHooks', () => {
  it('executes hooks if array is present', async () => {
    const hook1 = vi.fn()
    const hook2 = vi.fn()

    const blueprint = {
      get: vi.fn().mockReturnValue({
        onPreparingPage: [hook1, hook2]
      })
    }

    const context = {
      container: {
        make: vi.fn().mockReturnValue(blueprint)
      }
    }

    await executeHooks('onPreparingPage', context as any)

    expect(hook1).toHaveBeenCalledWith(context)
    expect(hook2).toHaveBeenCalledWith(context)
  })

  it('does nothing if no hooks', async () => {
    const blueprint = {
      get: vi.fn().mockReturnValue({})
    }

    const context = {
      container: {
        make: vi.fn().mockReturnValue(blueprint)
      }
    }

    await executeHooks('onPreparingPage', context as any) // no error = pass
  })
})
