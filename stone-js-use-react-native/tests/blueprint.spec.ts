import { getBlueprint, hasBlueprint } from '@stone-js/core'
import { UseReactNative } from '../src/decorators/UseReactNative'
import { ScreenStack } from '../src/ScreenStack'
import { defineStoneReactNativeApp } from '../src/blueprint/BlueprintUtils'
import { useReactNativeBlueprint } from '../src/options/UseReactNativeBlueprint'

describe('Enabling the renderer', () => {
  it('is enabled by its decorator', () => {
    @UseReactNative()
    class Application {}

    expect(hasBlueprint(Application)).toBe(true)
    expect(getBlueprint<any>(Application, {}).stone.useReactNative).toBeTruthy()
  })

  it('merges the options it was given', () => {
    const stack = ScreenStack.create()

    @UseReactNative({ screenStack: stack })
    class Application {}

    expect(getBlueprint<any>(Application, {}).stone.useReactNative.screenStack).toBe(stack)
  })

  it('never mutates the shared blueprint when decorating', () => {
    // Two applications in one process (a test suite, a monorepo build) must not leak options
    // into each other through the module-level default.
    @UseReactNative({ screenStack: ScreenStack.create() })
    class First {}

    @UseReactNative()
    class Second {}

    expect(useReactNativeBlueprint.stone.useReactNative).toEqual({})
    expect(getBlueprint<any>(Second, {}).stone.useReactNative.screenStack).toBeUndefined()
    expect(getBlueprint<any>(First, {}).stone.useReactNative.screenStack).toBeTruthy()
  })

  it('is enabled imperatively, with the same result', () => {
    const blueprint: any = defineStoneReactNativeApp({ name: 'my-app' })

    expect(blueprint.stone.name).toBe('my-app')
    expect(blueprint.stone.providers?.length).toBeGreaterThan(0)
    expect(blueprint.stone.services?.length).toBeGreaterThan(0)
  })

  it('takes an entry screen imperatively', () => {
    const Screen = (): any => ({ render: () => 'Home' })

    const blueprint: any = defineStoneReactNativeApp(Screen, { name: 'my-app' })

    expect(blueprint.stone.useReact.componentEventHandler.module).toBe(Screen)
    expect(blueprint.stone.useReact.componentEventHandler.isFactory).toBe(true)
  })

  it('takes a class entry screen imperatively', () => {
    class Screen { render (): string { return 'Home' } }

    const blueprint: any = defineStoneReactNativeApp(Screen as any, { name: 'my-app', isClass: true })

    expect(blueprint.stone.useReact.componentEventHandler.isClass).toBe(true)
    expect(blueprint.stone.useReact.componentEventHandler.isFactory).toBe(false)
  })

  it('merges the blueprints it was handed, such as the adapter\'s', () => {
    const blueprint: any = defineStoneReactNativeApp({ name: 'my-app' }, [{ stone: { marker: true } } as any])

    expect(blueprint.stone.marker).toBe(true)
  })

  it('takes an entry screen, options and blueprints together', () => {
    const Screen = (): any => ({ render: () => 'Home' })

    const blueprint: any = defineStoneReactNativeApp(Screen, { name: 'my-app' }, [{ stone: { marker: true } } as any])

    expect(blueprint.stone.marker).toBe(true)
    expect(blueprint.stone.useReact.componentEventHandler.module).toBe(Screen)
  })
})
