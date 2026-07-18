import { Mock } from 'vitest'
import { Container } from '../../src/Container'
import { Factory } from '../../src/models/Factory'
import { BindingValue } from '../../src/declarations'
import { ContainerError } from '../../src/errors/ContainerError'

describe('Factory', () => {
  let container: Container
  let resolverMock: Mock<any>
  let factory: Factory<BindingValue>

  beforeEach(() => {
    container = Container.create()
    resolverMock = vi.fn().mockReturnValue('resolvedValue')
    factory = new Factory(resolverMock)
  })

  it('should create a new instance each time resolve is called', () => {
    const firstInstance = factory.resolve(container)
    const secondInstance = factory.resolve(container)

    expect(firstInstance).toBe('resolvedValue')
    expect(secondInstance).toBe('resolvedValue')
    expect(resolverMock).toHaveBeenCalledTimes(2)
  })

  it('should throw a ContainerError if resolver fails', () => {
    const errorMessage = 'Resolver failed'
    resolverMock.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    expect(() => factory.resolve(container)).toThrow(ContainerError)
    expect(() => factory.resolve(container)).toThrowError(new ContainerError(ContainerError.CANNOT_RESOLVE_TYPE, errorMessage))
  })

  it('should throw a ContainerError if resolver is not a function', () => {
    // @ts-expect-error: intentionally passing incorrect type for testing
    expect(() => new Factory('undefined')).toThrow(ContainerError)
    // @ts-expect-error: intentionally passing incorrect type for testing
    expect(() => new Factory('undefined')).toThrowError(new ContainerError(ContainerError.RESOLVER_TYPE, 'undefined'))
  })
})
