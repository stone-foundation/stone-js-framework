import { Config } from '@stone-js/config'
import { IContainer } from '@stone-js/core'
import { STONE_SNAPSHOT } from '../src/constants'
import { ReactRuntime } from '../src/ReactRuntime'
import * as Utils from '../src/UseReactPageInternals'
import { UseReactServiceProvider } from '../src/UseReactServiceProvider'

vi.mock('@stone-js/config', () => ({
  Config: {
    fromJson: vi.fn(() => 'mocked-config')
  }
}))

describe('UseReactServiceProvider', () => {
  let container: IContainer

  beforeEach(() => {
    container = {
      singletonIf: vi.fn((v, fn) => fn()),
      make: vi.fn()
    } as unknown as IContainer
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call registerSnapshot in register()', async () => {
    const provider = new UseReactServiceProvider(container)
    // @ts-expect-error - private access
    provider.registerSnapshot = vi.fn()
    await provider.register()

    // @ts-expect-error - private access
    expect(provider.registerSnapshot).toHaveBeenCalled()
  })

  it('should set ReactRuntime.instance in boot()', async () => {
    const mockRuntime = {} as unknown as ReactRuntime
    vi.spyOn(container, 'make').mockReturnValue(mockRuntime)

    const provider = new UseReactServiceProvider(container)
    await provider.boot()

    expect(container.make).toHaveBeenCalledWith(ReactRuntime)
    expect(ReactRuntime.instance).toBe(mockRuntime)
  })

  it('should register empty snapshot on SSR', () => {
    vi.spyOn(Utils, 'isSSR').mockReturnValue(true)

    const provider = new UseReactServiceProvider(container)
    // @ts-expect-error - private access
    provider.registerSnapshot()

    expect(Config.fromJson).toHaveBeenCalledWith('{}')
    expect(container.singletonIf).toHaveBeenCalledWith('snapshot', expect.any(Function))

    // ensure the factory works
    const factory = (container.singletonIf as any).mock.calls[0][1]
    expect(factory()).toBe('mocked-config')
  })

  it('should register snapshot from DOM on client', () => {
    vi.spyOn(Utils, 'isSSR').mockReturnValue(false)
    const textContent = '{"foo":"bar"}'

    const element = { textContent } as unknown as HTMLElement
    vi.stubGlobal('window', {
      document: {
        getElementById: vi.fn().mockReturnValue(element)
      }
    })

    const provider = new UseReactServiceProvider(container)
    // @ts-expect-error - private access
    provider.registerSnapshot()

    expect(window.document.getElementById).toHaveBeenCalledWith(STONE_SNAPSHOT)
    expect(Config.fromJson).toHaveBeenCalledWith(textContent)
    expect(container.singletonIf).toHaveBeenCalledWith('snapshot', expect.any(Function))
  })

  it('should default to empty object if no snapshot element is found', () => {
    vi.spyOn(Utils, 'isSSR').mockReturnValue(false)
    vi.stubGlobal('window', {
      document: {
        getElementById: vi.fn().mockReturnValue(null)
      }
    })

    const provider = new UseReactServiceProvider(container)
    // @ts-expect-error - private access
    provider.registerSnapshot()

    expect(Config.fromJson).toHaveBeenCalledWith('{}')
  })
})
