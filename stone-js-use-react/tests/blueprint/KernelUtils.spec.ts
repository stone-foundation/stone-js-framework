import { GET } from '@stone-js/router'
import { definePage, definePageLayout, defineErrorPage } from '../../src/blueprint/KernelUtils'
import { ReactNode } from 'react'
import { IPage } from '../../src/declarations'

describe('definePage', () => {
  it('defines a factory-based page', () => {
    const factory = (): any => ({ render: () => 'component' })
    const result: any = definePage(factory, { path: '/home', layout: 'main' })

    expect(result.stone.router.definitions).toEqual([
      {
        path: '/home',
        layout: 'main',
        method: GET,
        methods: [],
        children: undefined,
        handler: {
          module: factory,
          layout: 'main',
          isComponent: true,
          isClass: undefined,
          isFactory: true
        }
      }
    ])
  })

  it('defines a class-based page', () => {
    class Page implements IPage<any> {
      render (): ReactNode {
        return 'Page Content'
      }
    }
    const result: any = definePage(Page, { path: '/', isClass: true })

    expect(result.stone.router.definitions[0].handler).toEqual({
      module: Page,
      isComponent: true,
      layout: undefined,
      isClass: true,
      isFactory: false
    })
  })
})

describe('definePageLayout', () => {
  it('defines a factory-based layout with default name', () => {
    const layoutFactory = (): any => ({ render: () => 'Layout' })
    const result = definePageLayout(layoutFactory)

    expect(result.stone.useReact.layout?.default).toEqual({
      module: layoutFactory,
      isClass: undefined,
      isFactory: true
    })
  })

  it('defines a class-based layout with custom name', () => {
    class Layout {
      render (): string {
        return 'Layout Content'
      }
    }
    const result = definePageLayout(Layout, { name: 'main', isClass: true })

    expect(result.stone.useReact.layout?.main).toEqual({
      module: Layout,
      isClass: true,
      isFactory: false
    })
  })
})

describe('defineErrorPage', () => {
  it('defines a factory-based error page with default error name', () => {
    const errorFactory = (): any => ({ render: () => 'Error Page' })
    const result = defineErrorPage(errorFactory)

    expect(result.stone.useReact.errorPages?.default).toEqual({
      module: errorFactory,
      error: 'default',
      isFactory: true
    })
  })

  it('defines a factory-based error page with custom error name', () => {
    const errorFactory = (): any => ({ render: () => 'Not Found' })
    const result = defineErrorPage(errorFactory, { error: 'NotFound', layout: 'minimal' })

    expect(result.stone.useReact.errorPages?.NotFound).toEqual({
      module: errorFactory,
      error: 'NotFound',
      layout: 'minimal',
      isFactory: true
    })
  })

  it('defines a class-based error page with multiple error names', () => {
    class CrashPage {
      render (): string {
        return 'Crash Page'
      }
    }
    const result = defineErrorPage(CrashPage, {
      error: ['Crash', 'Panic'],
      layout: 'alert',
      isClass: true
    })

    expect(result.stone.useReact.errorPages).toEqual({
      Crash: {
        module: CrashPage,
        layout: 'alert',
        error: 'Crash',
        isFactory: false,
        isClass: true
      },
      Panic: {
        module: CrashPage,
        layout: 'alert',
        error: 'Panic',
        isFactory: false,
        isClass: true
      }
    })
  })
})
