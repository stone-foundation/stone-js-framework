import { NODE_CONSOLE_PLATFORM } from '@stone-js/router'
import { BROWSER_PLATFORM } from '@stone-js/browser-adapter'
import { hasMetadata, getMetadata, isMatchedAdapter } from '@stone-js/core'
import {
  SetSSRStaticFileMiddleware,
  SetSSRCompressionMiddleware,
  SetReactAdapterErrorPageMiddleware as ServerSetReactAdapterErrorPageMiddleware
} from '../../src/server/middleware/BlueprintMiddleware'
import { SetBrowserResponseMiddlewareMiddleware, SetReactAdapterErrorPageMiddleware } from '../../src/browser/middleware/BlueprintMiddleware'
import { SetUseReactHooksMiddleware, SetReactKernelErrorPageMiddleware, SetReactRouteDefinitionsMiddleware, SetReactPageLayoutMiddleware, SetReactViewProvidersMiddleware, SetUseReactEventHandlerMiddleware } from '../../src/middleware/BlueprintMiddleware'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mock core utils
vi.mock('@stone-js/core', async (mod) => ({
  ...(await mod()),
  hasMetadata: vi.fn(),
  getMetadata: vi.fn(),
  isMatchedAdapter: vi.fn()
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const mockBlueprint = (): any => {
  const store: Record<string, any> = {}
  return {
    get: vi.fn((key: string, fallback: any) => store[key] ?? fallback),
    set: vi.fn((key: string, value: any) => {
      store[key] = value
    }),
    setIf: vi.fn((key: string, value: any) => {
      if (store[key] === undefined) store[key] = value
    }),
    add: vi.fn((key: string, value: any[]) => {
      if (!Array.isArray(store[key])) store[key] = []
      store[key].push(...value)
    }),
    has: vi.fn((key: string) => store[key] !== undefined)
  }
}

const runMiddleware = async (middleware: any, contextOverrides: any = {}): Promise<any> => {
  const blueprint = contextOverrides.blueprint ?? mockBlueprint()
  const modules = contextOverrides.modules ?? []
  const context = {
    modules,
    blueprint
  }
  const next = vi.fn().mockResolvedValue(blueprint)
  const result = await middleware(context, next)
  return { blueprint, context, result, next }
}

describe('BlueprintMiddleware Browser', () => {
  it('SetBrowserResponseMiddlewareMiddleware adds adapter middleware if platform is browser', async () => {
    const { blueprint } = await runMiddleware(SetBrowserResponseMiddlewareMiddleware, {
      blueprint: { ...mockBlueprint(), get: () => BROWSER_PLATFORM }
    })
    expect(blueprint.add).toHaveBeenCalledWith('stone.adapter.middleware', expect.any(Array))
  })

  it('SetReactAdapterErrorPageMiddleware sets default and platform/alias matched handlers for csr', async () => {
    vi.mocked(hasMetadata).mockReturnValue(true)
    vi.mocked(isMatchedAdapter).mockReturnValue(true)
    vi.mocked(getMetadata).mockReturnValue({ error: 'default', layout: 'x', adapterAlias: 'a', platform: 'p' })
    const blueprint = mockBlueprint()

    blueprint.set('stone.useReact.adapterErrorPages', { NotFound: { module: () => {} } })

    const fakeModule = class {}
    await runMiddleware(SetReactAdapterErrorPageMiddleware, {
      blueprint,
      modules: [fakeModule]
    })

    expect(blueprint.set).toHaveBeenCalledWith('stone.adapter.errorHandlers.default', expect.objectContaining({ isClass: true }))
    expect(blueprint.set).toHaveBeenCalledWith('stone.useReact.adapterErrorPages.default', expect.objectContaining({ layout: 'x' }))
    expect(blueprint.set).toHaveBeenCalledWith('stone.adapter.errorHandlers.default', expect.objectContaining({ isClass: true }))
  })
})

describe('BlueprintMiddleware Server', () => {
  it('SetReactAdapterErrorPageMiddleware sets default and platform/alias matched handlers for ssr', async () => {
    vi.mocked(hasMetadata).mockReturnValue(true)
    vi.mocked(isMatchedAdapter).mockReturnValue(true)
    vi.mocked(getMetadata).mockReturnValue({ error: 'default', layout: 'x', adapterAlias: 'a', platform: 'p' })
    const blueprint = mockBlueprint()

    blueprint.set('stone.useReact.adapterErrorPages', { NotFound: { module: () => {} } })

    const fakeModule = class {}
    await runMiddleware(ServerSetReactAdapterErrorPageMiddleware, {
      blueprint,
      modules: [fakeModule]
    })

    expect(blueprint.set).toHaveBeenCalledWith('stone.adapter.errorHandlers.default', expect.objectContaining({ isClass: true }))
    expect(blueprint.set).toHaveBeenCalledWith('stone.useReact.adapterErrorPages.default', expect.objectContaining({ layout: 'x' }))
    expect(blueprint.set).toHaveBeenCalledWith('stone.adapter.errorHandlers.default', expect.objectContaining({ isClass: true }))
  })

  it('SetSSRStaticFileMiddleware adds static middleware only on SSR', async () => {
    const { blueprint } = await runMiddleware(SetSSRStaticFileMiddleware)
    expect(blueprint.add).toHaveBeenCalledWith('stone.kernel.middleware', expect.any(Array))
  })

  it('SetSSRCompressionMiddleware adds compression middleware only on SSR', async () => {
    const { blueprint } = await runMiddleware(SetSSRCompressionMiddleware)
    expect(blueprint.add).toHaveBeenCalledWith('stone.kernel.middleware', expect.any(Array))
  })
})

describe('BlueprintMiddleware', () => {
  it('SetUseReactHooksMiddleware adds onPreparingResponse if not an ignorePlatforms', async () => {
    const get = vi.fn()
      .mockReturnValueOnce('browser-adapter')
      .mockReturnValueOnce(['node-cli', 'node-http'])
    const { blueprint } = await runMiddleware(SetUseReactHooksMiddleware, {
      blueprint: { ...mockBlueprint(), get, add: vi.fn() }
    })
    expect(blueprint.add).toHaveBeenCalledWith('stone.lifecycleHooks.onPreparingResponse', expect.any(Array))
  })

  it('SetUseReactHooksMiddleware skips for console platform', async () => {
    const get = vi.fn()
      .mockReturnValueOnce(NODE_CONSOLE_PLATFORM)
      .mockReturnValueOnce([NODE_CONSOLE_PLATFORM, 'node-http'])
    const { blueprint } = await runMiddleware(SetUseReactHooksMiddleware, {
      blueprint: { ...mockBlueprint(), get, add: vi.fn() }
    })
    expect(blueprint.add).not.toHaveBeenCalled()
  })

  it('SetReactKernelErrorPageMiddleware sets default and named handlers from metadata', async () => {
    vi.mocked(hasMetadata).mockReturnValue(true)
    vi.mocked(getMetadata).mockReturnValue({ error: 'NotFound', layout: 'default' })
    const blueprint = mockBlueprint()

    blueprint.set('stone.useReact.errorPages', { NotFound: { module: () => {} } })

    const fakeModule = class {}
    await runMiddleware(SetReactKernelErrorPageMiddleware, {
      blueprint,
      modules: [fakeModule]
    })

    expect(blueprint.set).toHaveBeenCalledWith('stone.kernel.errorHandlers.default', expect.objectContaining({ isClass: true }))
    expect(blueprint.set).toHaveBeenCalledWith('stone.useReact.errorPages.NotFound', expect.objectContaining({ layout: 'default' }))
    expect(blueprint.set).toHaveBeenCalledWith('stone.kernel.errorHandlers.NotFound', expect.objectContaining({ isClass: true }))
  })

  it('SetReactRouteDefinitionsMiddleware sets page route definitions', async () => {
    vi.mocked(hasMetadata).mockReturnValue(true)
    vi.mocked(getMetadata).mockReturnValue({ path: '/x', handler: {} })

    const fakeModule = class {}
    const { blueprint } = await runMiddleware(SetReactRouteDefinitionsMiddleware, {
      modules: [fakeModule]
    })

    expect(blueprint.add).toHaveBeenCalledWith('stone.router.definitions', [expect.objectContaining({
      path: '/x',
      handler: expect.objectContaining({ module: fakeModule })
    })])
  })

  it('SetReactPageLayoutMiddleware sets layout definitions from metadata', async () => {
    vi.mocked(hasMetadata).mockReturnValue(true)
    vi.mocked(getMetadata).mockReturnValue({ name: 'default' })

    const fakeModule = class {}
    const { blueprint } = await runMiddleware(SetReactPageLayoutMiddleware, {
      modules: [fakeModule]
    })

    expect(blueprint.set).toHaveBeenCalledWith('stone.useReact.layouts.default', { isClass: true, module: fakeModule })
  })

  it('SetReactViewProvidersMiddleware registers @ViewProvider classes into stone.useReact.providers', async () => {
    vi.mocked(hasMetadata).mockReturnValue(true)
    vi.mocked(getMetadata).mockReturnValue({ priority: 5, props: { theme: 'dark' } })

    const fakeProvider = class {}
    const { blueprint } = await runMiddleware(SetReactViewProvidersMiddleware, {
      modules: [fakeProvider]
    })

    expect(blueprint.add).toHaveBeenCalledWith('stone.useReact.providers', [expect.objectContaining({
      __viewProvider: true,
      module: fakeProvider,
      isClass: true,
      priority: 5,
      props: { theme: 'dark' }
    })])
  })

  it('SetReactViewProvidersMiddleware registers nothing when no module is decorated', async () => {
    vi.mocked(hasMetadata).mockReturnValue(false)

    const { blueprint } = await runMiddleware(SetReactViewProvidersMiddleware, {
      modules: [class {}]
    })

    expect(blueprint.add).not.toHaveBeenCalledWith('stone.useReact.providers', expect.anything())
  })

  it('SetUseReactEventHandlerMiddleware sets default and event handler if present', async () => {
    vi.mocked(hasMetadata).mockReturnValue(true)

    const fakeModule = class {}
    const { blueprint } = await runMiddleware(SetUseReactEventHandlerMiddleware, {
      modules: [fakeModule]
    })

    expect(blueprint.setIf).toHaveBeenCalledWith('stone.kernel.eventHandler', expect.objectContaining({ module: expect.any(Function) }))
    expect(blueprint.set).toHaveBeenCalledWith('stone.useReact.componentEventHandler', expect.objectContaining({ module: fakeModule }))
  })
})
