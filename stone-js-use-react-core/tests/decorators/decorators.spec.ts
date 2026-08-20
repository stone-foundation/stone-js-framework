import { GET } from '@stone-js/router'
import { Page } from '../../src/decorators/Page'
import { Hook } from '../../src/decorators/Hook'
import { ErrorPage } from '../../src/decorators/ErrorPage'
import { PageLayout } from '../../src/decorators/PageLayout'
import { PageStatus } from '../../src/decorators/PageStatus'
import { AdapterErrorPage } from '../../src/decorators/AdapterErrorPage'
import { ViewProvider } from '../../src/decorators/ViewProvider'
import { setMetadata, addMetadata, LIFECYCLE_HOOK_KEY, addBlueprint } from '@stone-js/core'
import { REACT_PAGE_KEY, REACT_ADAPTER_ERROR_PAGE_KEY, REACT_ERROR_PAGE_KEY, REACT_PAGE_LAYOUT_KEY, REACT_VIEW_PROVIDER_KEY, STONE_REACT_APP_KEY } from '../../src/decorators/constants'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mocks
vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addMetadata: vi.fn(() => {}),
    setMetadata: vi.fn(() => {}),
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: vi.fn((fn: Function) => {
      fn(class {}, { kind: 'class' })
      return fn
    })
  }
})

describe('Page', () => {
  it('should call setMetadata with default layout and method GET', () => {
    Page('/dashboard')(class {})

    expect(setMetadata).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'class' }),
      REACT_PAGE_KEY,
      expect.objectContaining({
        path: '/dashboard',
        method: GET,
        methods: [],
        handler: {
          module: expect.any(Function),
          isComponent: true,
          isClass: true,
          layout: undefined
        }
      })
    )
  })

  it('should respect layout passed in options', () => {
    Page('/login', { layout: 'auth' })(class {})

    expect(setMetadata).toHaveBeenCalledWith(
      expect.anything(),
      REACT_PAGE_KEY,
      expect.objectContaining({
        path: '/login',
        layout: 'auth',
        handler: expect.objectContaining({
          layout: 'auth'
        })
      })
    )
  })
})

describe('PageStatus decorator', () => {
  it('should wrap method and return content + statusCode + headers', async () => {
    const decorated = PageStatus(201, { 'X-Test': 'yes' })(async function () {
      return 'data'
    }, { kind: 'method', name: 'show' } as any, {}) as any

    const result = await decorated()
    expect(result).toEqual({ content: 'data', statusCode: 201, headers: { 'X-Test': 'yes' } })
  })

  it('should default to 200 and empty headers', async () => {
    const decorated = PageStatus()(async function () {
      return 'ok'
    }, { kind: 'method', name: 'show' } as any, {}) as any

    const result = await decorated()
    expect(result).toEqual({ content: 'ok', statusCode: 200, headers: {} })
  })
})

describe('Hook decorator', () => {
  it('should call addMetadata with lifecycle key and method name', () => {
    const ctx = { kind: 'method', name: 'onPreparingPage' } as any
    Hook('onPreparingPage')(() => {}, ctx, {})
    expect(addMetadata).toHaveBeenCalledWith(ctx, LIFECYCLE_HOOK_KEY, {
      name: 'onPreparingPage',
      method: 'onPreparingPage'
    })
  })
})

describe('PageLayout decorator', () => {
  it('should call setMetadata with layout options', () => {
    const opts = { name: 'MainLayout' }
    PageLayout(opts)(class {})
    expect(setMetadata).toHaveBeenCalledWith(
      expect.any(Object),
      REACT_PAGE_LAYOUT_KEY,
      { ...opts, isClass: true }
    )
  })
})

describe('ViewProvider decorator', () => {
  it('should call setMetadata with view provider options and isClass', () => {
    const opts = { priority: 5, props: { theme: 'dark' } }
    ViewProvider(opts)(class {})
    expect(setMetadata).toHaveBeenCalledWith(
      expect.any(Object),
      REACT_VIEW_PROVIDER_KEY,
      { ...opts, isClass: true }
    )
  })

  it('should default to empty options', () => {
    ViewProvider()(class {})
    expect(setMetadata).toHaveBeenCalledWith(
      expect.any(Object),
      REACT_VIEW_PROVIDER_KEY,
      { isClass: true }
    )
  })
})

describe('ErrorPage decorator', () => {
  it('should call setMetadata with error page options', () => {
    const opts = { error: 'MyError' }
    ErrorPage(opts)(class {})
    expect(setMetadata).toHaveBeenCalledWith(
      expect.any(Object),
      REACT_ERROR_PAGE_KEY,
      { ...opts, isClass: true }
    )
  })
})

describe('AdapterErrorPage decorator', () => {
  it('should call setMetadata with adapter error page options', () => {
    const opts = { error: 'MyAdapterError' }
    AdapterErrorPage(opts)(class {})
    expect(setMetadata).toHaveBeenCalledWith(
      expect.any(Object),
      REACT_ADAPTER_ERROR_PAGE_KEY,
      { ...opts, isClass: true }
    )
  })
})
