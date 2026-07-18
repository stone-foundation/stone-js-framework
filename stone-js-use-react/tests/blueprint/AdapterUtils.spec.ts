import { AdapterErrorPageOptions } from '../../src/declarations'
import { defineAdapterErrorPage } from '../../src/blueprint/AdapterUtils'

describe('defineAdapterErrorPage', () => {
  it('defines a factory-based adapter error page with default error name', () => {
    const factory = (): any => ({ render: () => 'component' })
    const result = defineAdapterErrorPage(factory)

    expect(result).toEqual({
      stone: {
        useReact: {
          adapterErrorPages: {
            default: {
              module: factory,
              error: 'default',
              isFactory: true
            }
          }
        }
      }
    })
  })

  it('defines a factory-based error page with a single error name', () => {
    const factory = (): any => ({ render: () => 'component' })
    const options: AdapterErrorPageOptions = { error: 'NotFound', layout: 'main' }
    const result = defineAdapterErrorPage(factory, options)

    expect(result).toEqual({
      stone: {
        useReact: {
          adapterErrorPages: {
            NotFound: {
              ...options,
              module: factory,
              error: 'NotFound',
              isFactory: true
            }
          }
        }
      }
    })
  })

  it('defines a factory-based error page with multiple error names', () => {
    const factory = (): any => ({ render: () => 'component' })
    const options: AdapterErrorPageOptions = { error: ['A', 'B'], layout: 'err' }
    const result = defineAdapterErrorPage(factory, options)

    expect(result.stone.useReact.adapterErrorPages).toEqual({
      A: expect.objectContaining({
        module: factory,
        error: 'A',
        layout: 'err',
        isFactory: true
      }),
      B: expect.objectContaining({
        module: factory,
        error: 'B',
        layout: 'err',
        isFactory: true
      })
    })
  })

  it('defines a class-based error page with isClass: true', () => {
    class MyErrorComponent {
      render (): string {
        return 'Error Component'
      }
    }
    const options = { error: 'Crash', layout: 'alert', isClass: true }
    const result = defineAdapterErrorPage(MyErrorComponent, options)

    expect(result).toEqual({
      stone: {
        useReact: {
          adapterErrorPages: {
            Crash: {
              ...options,
              module: MyErrorComponent,
              error: 'Crash',
              isFactory: false
            }
          }
        }
      }
    })
  })
})
