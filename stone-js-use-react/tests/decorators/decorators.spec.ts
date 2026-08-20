import { GET } from '@stone-js/router'
import { ReactRuntime } from '../../src/ReactRuntime'
import { Snapshot } from '../../src/decorators/Snapshot'
import { UseReact } from '../../src/browser/decorators/UseReact'
import { UseReact as ServerUseReact } from '../../src/server/decorators/UseReact'
import { useReactBlueprint } from '../../src/browser/options/BrowserUseReactBlueprint'
import { setMetadata, addMetadata, LIFECYCLE_HOOK_KEY, addBlueprint } from '@stone-js/core'
import { useReactBlueprint as serverUseReactBlueprint } from '../../src/server/options/ServerUseReactBlueprint'
import { REACT_PAGE_KEY, REACT_ADAPTER_ERROR_PAGE_KEY, REACT_ERROR_PAGE_KEY, REACT_PAGE_LAYOUT_KEY, REACT_VIEW_PROVIDER_KEY, STONE_REACT_APP_KEY } from '@stone-js/use-react-core'

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

describe('UseReact', () => {
  it('should call setMetadata and addBlueprint with provided options', () => {
    const options: any = { foo: 'bar' }
    UseReact(options)(class {})
    ServerUseReact(options)(class {})

    expect(setMetadata).toHaveBeenCalledWith(
      expect.any(Object),
      STONE_REACT_APP_KEY,
      { isComponent: true, isClass: true }
    )

    expect(setMetadata).toHaveBeenCalledWith(
      expect.any(Object),
      STONE_REACT_APP_KEY,
      { isComponent: true, isClass: true }
    )

    expect(addBlueprint).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Object),
      useReactBlueprint,
      { stone: { useReact: options } }
    )

    expect(addBlueprint).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Object),
      serverUseReactBlueprint,
      { stone: { useReact: options } }
    )
  })

  it('should use empty options if none are passed', () => {
    UseReact()(class {})
    ServerUseReact()(class {})

    expect(addBlueprint).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      useReactBlueprint,
      { stone: { useReact: {} } }
    )

    expect(addBlueprint).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      serverUseReactBlueprint,
      { stone: { useReact: {} } }
    )
  })
})

describe('Snapshot decorator', () => {
  it('should call snapshot on ReactRuntime', async () => {
    const spy = vi.fn()
    ReactRuntime.instance = {
      snapshot: spy
    } as any

    const decorated = Snapshot('test.snapshot')(async function () {
      return 'data'
    }, { kind: 'method', name: 'testMethod' } as any, {}) as any

    await decorated.call({})
    expect(spy).toHaveBeenCalledWith('test.snapshot', expect.any(Function))
  })

  it('should infer name if not provided', async () => {
    const spy = vi.fn()
    class Example {}
    ReactRuntime.instance = {
      snapshot: spy
    } as any

    const decorated = Snapshot()(async function () {
      return 'data'
    }, { kind: 'method', name: 'show' } as any, {}) as any

    await decorated.call(new Example())
    expect(spy).toHaveBeenCalledWith('Example.show', expect.any(Function))
  })
})
