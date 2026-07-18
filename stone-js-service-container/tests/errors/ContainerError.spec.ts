import { BindingKey } from '../../src/declarations'
import { ContainerError } from '../../src/errors/ContainerError'

describe('ContainerError', () => {
  it('should create a ContainerError when no types are provided', () => {
    const message: BindingKey = {}
    const error = new ContainerError('', message)

    expect(error.message).toBe('An error has occurred.')
  })

  it('should create a ContainerError with alias conflict type', () => {
    const message: BindingKey = 'TestAlias'
    const error = new ContainerError(ContainerError.ALIAS_TYPE, message)

    expect(error.name).toBe('ContainerError')
    // @ts-expect-error - access private member for test purposes
    expect(error.type).toBe(ContainerError.ALIAS_TYPE)
    expect(error.message).toBe('TestAlias is aliased to itself')
  })

  it('should create a ContainerError for resolution failure with correct message', () => {
    const message: BindingKey = 'TestKey'
    const error = new ContainerError(ContainerError.RESOLUTION_TYPE, message)

    expect(error.name).toBe('ContainerError')
    // @ts-expect-error - access private member for test purposes
    expect(error.type).toBe(ContainerError.RESOLUTION_TYPE)
    expect(error.message).toContain("Failed to resolve a binding with a key of type string with a value of 'TestKey'")
  })

  it('should create a ContainerError for resolution failure with undefined key', () => {
    // @ts-expect-error: intentionally passing incorrect type for testing
    const message: BindingKey = undefined
    const error = new ContainerError(ContainerError.RESOLUTION_TYPE, message)

    expect(error.message).toBe('Failed to resolve a binding with a key of undefined from the service container.')
  })

  it('should create a ContainerError for resolution failure with null key', () => {
    // @ts-expect-error: intentionally passing incorrect type for testing
    const message: BindingKey = null
    const error = new ContainerError(ContainerError.RESOLUTION_TYPE, message)

    expect(error.message).toBe('Failed to resolve a binding with a key of null from the service container.')
  })

  it('should create a ContainerError for resolution failure with function key', () => {
    const message: BindingKey = function testFunction () {
      // Empty function for testing
    }
    const error = new ContainerError(ContainerError.RESOLUTION_TYPE, message)

    expect(error.message).toBe('Failed to resolve a binding with a key of [Function: testFunction] from the service container.')
  })

  it('should create a ContainerError for resolution failure with arrow function key', () => {
    const error = new ContainerError(ContainerError.RESOLUTION_TYPE, () => {})

    expect(error.message).toBe('Failed to resolve a binding with a key of [Function] from the service container.')
  })

  it('should create a ContainerError for resolution failure with object key', () => {
    const message: BindingKey = {}
    const error = new ContainerError(ContainerError.RESOLUTION_TYPE, message)

    expect(error.message).toBe('Failed to resolve a binding with a key of [Object: Object] from the service container.')
  })

  it('should create a ContainerError for resolution failure with symbol key', () => {
    const message: BindingKey = Symbol('TestSymbol')
    const error = new ContainerError(ContainerError.RESOLUTION_TYPE, message)

    expect(error.message).toBe('Failed to resolve a binding with a key of Symbol(TestSymbol) from the service container.')
  })

  it('should create a ContainerError for invalid resolver type', () => {
    const message: BindingKey = 123
    const error = new ContainerError(ContainerError.RESOLVER_TYPE, message)

    expect(error.name).toBe('ContainerError')
    // @ts-expect-error - access private member for test purposes
    expect(error.type).toBe(ContainerError.RESOLVER_TYPE)
    expect(error.message).toBe('Invalid resolver: Expected a function but received number')
  })

  it('should create a ContainerError for unbound alias', () => {
    const message: BindingKey = 'UnboundAlias'
    const error = new ContainerError(ContainerError.ALIAS_UNBOUND_TYPE, message)

    expect(error.name).toBe('ContainerError')
    // @ts-expect-error - access private member for test purposes
    expect(error.type).toBe(ContainerError.ALIAS_UNBOUND_TYPE)
    expect(error.message).toBe('Cannot alias an unbound value : UnboundAlias')
  })

  it('should create a ContainerError for not a service type', () => {
    const message: BindingKey = 'InvalidService'
    const error = new ContainerError(ContainerError.NOT_A_SERVICE_TYPE, message)

    expect(error.name).toBe('ContainerError')
    // @ts-expect-error - access private member for test purposes
    expect(error.type).toBe(ContainerError.NOT_A_SERVICE_TYPE)
    expect(error.message).toBe('This (InvalidService) is not a service. Must contain $$metadata$$ static property or must use @Service decorator.')
  })

  it('should create a ContainerError for cannot resolve type', () => {
    const message: BindingKey = 'CannotResolve'
    const error = new ContainerError(ContainerError.CANNOT_RESOLVE_TYPE, message)

    expect(error.name).toBe('ContainerError')
    // @ts-expect-error - access private member for test purposes
    expect(error.type).toBe(ContainerError.CANNOT_RESOLVE_TYPE)
    expect(error.message).toBe('Failed to resolve binding: CannotResolve')
  })
})
