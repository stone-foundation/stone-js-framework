import { UseReactBlueprint } from '../../src/options/UseReactBlueprint'
import { defineStoneReactApp } from '../../src/blueprint/BlueprintUtils'

describe('defineStoneReactApp', () => {
  const mockBlueprint = { stone: { useReact: { custom: true } } }

  it('creates blueprint using factory module (default)', () => {
    const handler = (): any => ({ render: () => 'Main' })
    const result = defineStoneReactApp(handler) as UseReactBlueprint

    expect(result.stone.useReact.componentEventHandler).toEqual({
      module: handler,
      isComponent: true,
      isClass: undefined,
      isFactory: true
    })
  })

  it('creates blueprint using class module (isClass: true)', () => {
    class Page {
      render (): string {
        return 'Main'
      }
    }
    const result = defineStoneReactApp(Page, { isClass: true, useReact: { foo: 'bar' } as any }) as UseReactBlueprint

    expect(result.stone.useReact.componentEventHandler).toEqual({
      module: Page,
      isComponent: true,
      isClass: true,
      isFactory: false
    })
  })

  it('creates blueprint with no handler, only options + blueprints', () => {
    const result = defineStoneReactApp({ useReact: { foo: 'bar' } as any }, [mockBlueprint]) as UseReactBlueprint

    // @ts-expect-error
    expect(result.stone.useReact.foo).toBe('bar')
    expect(result.stone.useReact.componentEventHandler).toBeUndefined()
  })

  it('creates blueprint with no handler and blueprints, only options', () => {
    const result = defineStoneReactApp({ useReact: { foo: 'bar' } as any }) as UseReactBlueprint

    // @ts-expect-error
    expect(result.stone.useReact.foo).toBe('bar')
    expect(result.stone.useReact.componentEventHandler).toBeUndefined()
  })

  it('creates blueprint with handler + blueprints array', () => {
    const handler = (): any => ({ render: () => 'Main' })
    const result = defineStoneReactApp(handler, {}, [mockBlueprint]) as UseReactBlueprint

    expect(result.stone.useReact.componentEventHandler?.module).toBe(handler)
  })

  it('creates blueprint with class handler + options + blueprints', () => {
    class MyPage {
      render (): string {
        return 'Main'
      }
    }
    const result = defineStoneReactApp(MyPage, { isClass: true, useReact: { foo: 1 } as any }, [mockBlueprint]) as UseReactBlueprint

    // @ts-expect-error
    expect(result.stone.useReact.foo).toBe(1)
    expect(result.stone.useReact.componentEventHandler?.isClass).toBe(true)
  })
})
