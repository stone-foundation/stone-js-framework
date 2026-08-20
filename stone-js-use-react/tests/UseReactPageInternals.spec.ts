import { ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import { StoneError } from '../src/components/StoneError'
import { applyHeadToHtml } from '@stone-js/use-view'
import { getAppRootElement, getBrowserContent, defaultHtmlTemplate, getServerContent, htmlTemplate, hydrateReactApp, renderReactApp, renderStoneSnapshot, snapshotResponse } from '../src/UseReactPageInternals'
import { buildAdapterErrorComponent, buildAppComponent, buildLayoutComponent, buildPageComponent, executeHandler, executeHooks, getResponseSnapshot, isClient, isServer, isSSR, mergeHead, resolveComponent, resolveLayoutHead, resolveLazyComponent, StonePage, UseReactError } from '@stone-js/use-react-core'

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

describe('htmlTemplate', () => {
  const blueprintWith = (values: Record<string, unknown>): any => ({
    get: vi.fn((key: string, fallback?: unknown) => values[key] ?? fallback)
  })

  it('returns the configured template untouched', () => {
    const blueprint = blueprintWith({ 'stone.useReact.htmlTemplateContent': '<html>mine</html>' })

    expect(htmlTemplate(blueprint)).toBe('<html>mine</html>')
  })

  it('falls back to a minimal shell when a build never generated one', () => {
    // Rendering a page with no build step is a real context — a test — and refusing to render there
    // served nobody. The shell is this renderer's own contract, so it can produce one.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const template = htmlTemplate(blueprintWith({}))

    expect(template).toContain('<!--app-head-->')
    expect(template).toContain('<div id="root"><!--app-html--></div>')
    warn.mockRestore()
  })

  it('honours a configured root element, so hydration still finds it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const template = htmlTemplate(blueprintWith({ 'stone.useReact.rootElementId': 'app' }))

    expect(template).toContain('<div id="app"><!--app-html--></div>')
    warn.mockRestore()
  })

  it('says it once, not on every request', () => {
    // An SSR server would otherwise repeat the warning for every page it renders.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    htmlTemplate(blueprintWith({}))
    htmlTemplate(blueprintWith({}))

    expect(warn).toHaveBeenCalledTimes(0)
    warn.mockRestore()
  })

  it('exposes the shell on its own, for anything that needs to state it', () => {
    expect(defaultHtmlTemplate('mount')).toContain('<div id="mount"><!--app-html--></div>')
    expect(defaultHtmlTemplate()).toContain('<div id="root">')
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
