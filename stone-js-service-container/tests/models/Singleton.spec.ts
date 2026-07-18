import { Mock } from 'vitest'
import { Container } from '../../src/Container'
import { BindingValue } from '../../src/declarations'
import { Singleton } from '../../src/models/Singleton'
import { ContainerError } from '../../src/errors/ContainerError'

describe('Singleton', () => {
  let container: Container
  let resolverMock: Mock<any>
  let singleton: Singleton<BindingValue>

  beforeEach(() => {
    container = Container.create()
    resolverMock = vi.fn().mockReturnValue('resolvedValue')
    singleton = new Singleton(resolverMock)
  })

  it('should resolve and cache the value on the first call', () => {
    const resolvedValue = singleton.resolve(container)
    expect(resolvedValue).toBe('resolvedValue')
    expect(resolverMock).toHaveBeenCalledTimes(1)
  })

  it('should return the cached value on subsequent calls', () => {
    singleton.resolve(container)
    const secondResolvedValue = singleton.resolve(container)
    expect(secondResolvedValue).toBe('resolvedValue')
    expect(resolverMock).toHaveBeenCalledTimes(1)
  })

  it('should throw a ContainerError if resolver fails', () => {
    const errorMessage = 'Resolver failed'
    resolverMock.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    expect(() => singleton.resolve(container)).toThrow(ContainerError)
    expect(() => singleton.resolve(container)).toThrowError(new ContainerError(ContainerError.CANNOT_RESOLVE_TYPE, errorMessage))
  })
})
