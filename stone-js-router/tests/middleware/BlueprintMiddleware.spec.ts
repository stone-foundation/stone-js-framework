import { hasMetadata, getMetadata } from '@stone-js/core'
import { NODE_CONSOLE_PLATFORM } from '../../src/constants'
import { RouterEventHandler } from '../../src/RouterEventHandler'
import { MATCH_KEY, GROUP_KEY } from '../../src/decorators/constants'
import { RouterCommand, routerCommandOptions } from '../../src/commands/RouterCommand'
import { RouteDefinitionsMiddleware, SetRouterCommandsMiddleware, SetRouterEventHandlerMiddleware } from '../../src/middleware/BlueprintMiddleware'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    hasMetadata: vi.fn(() => true),
    getMetadata: vi.fn()
  }
})

describe('RouteDefinitionsMiddleware', () => {
  it('should register route group and children definitions to the blueprint', async () => {
    const fakeModule = class {}

    const childDefs = [{ path: '/child', method: 'GET' }]
    const parentDef = { path: '/parent', handler: { isClass: true }, children: [] }

    vi.mocked(hasMetadata).mockReturnValue(true)
    vi.mocked(getMetadata).mockImplementation((mod, key, fallback) => {
      if (key === MATCH_KEY) return childDefs
      if (key === GROUP_KEY) return parentDef
      return fallback
    })

    const add = vi.fn()
    const context = {
      modules: [fakeModule],
      blueprint: { add }
    } as any

    const next = vi.fn(async (ctx) => ctx.blueprint)

    await RouteDefinitionsMiddleware(context, next)

    expect(add).toHaveBeenCalledWith('stone.router.definitions', [
      { ...parentDef, children: childDefs, handler: { ...parentDef.handler, module: fakeModule } }
    ])
    expect(next).toHaveBeenCalled()
  })

  it('should skip modules without GROUP_KEY metadata', async () => {
    vi.mocked(hasMetadata).mockReturnValue(false)

    const add = vi.fn()
    const context = {
      modules: [class {}],
      blueprint: { add }
    } as any

    const next = vi.fn(async (ctx) => ctx.blueprint)

    await RouteDefinitionsMiddleware(context, next)

    expect(add).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})

describe('SetRouterEventHandlerMiddleware', () => {
  it('should set router event handler to blueprint', async () => {
    const set = vi.fn()

    const context = {
      modules: [],
      blueprint: { set }
    } as any

    const next = vi.fn(async (ctx) => ctx.blueprint)

    await SetRouterEventHandlerMiddleware(context, next)

    expect(set).toHaveBeenCalledWith('stone.kernel.eventHandler', { module: RouterEventHandler, isClass: true })
    expect(next).toHaveBeenCalled()
  })
})

describe('SetRouterCommandsMiddleware', () => {
  it('should register router commands if platform is console', async () => {
    const add = vi.fn()
    const get = vi.fn(() => NODE_CONSOLE_PLATFORM)

    const context = {
      modules: [],
      blueprint: { get, add }
    } as any

    const next = vi.fn(async (ctx) => ctx.blueprint)

    await SetRouterCommandsMiddleware(context, next)

    expect(add).toHaveBeenCalledWith('stone.adapter.commands', [{
      module: RouterCommand,
      isClass: true,
      options: routerCommandOptions
    }])
    expect(next).toHaveBeenCalled()
  })

  it('should skip command registration if platform is not console', async () => {
    const add = vi.fn()
    const get = vi.fn(() => 'not-console')

    const context = {
      modules: [],
      blueprint: { get, add }
    } as any

    const next = vi.fn(async (ctx) => ctx.blueprint)

    await SetRouterCommandsMiddleware(context, next)

    expect(add).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
