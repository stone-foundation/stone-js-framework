import { Container } from '../src/Container'
import { ContainerError } from '../src/errors/ContainerError'

describe('Container', () => {
  let container: Container

  beforeEach(() => {
    container = Container.create()
  })

  it('should bind and resolve an instance', () => {
    container.instance('testKey', 'testValue')
    expect(container.make('testKey')).toBe('testValue')
  })

  it('should bind and resolve a singleton', () => {
    const resolver = vi.fn(() => ({ value: 'singletonValue' }))
    container.singleton('singletonKey', resolver)

    const instance1 = container.make('singletonKey')
    const instance2 = container.make('singletonKey')

    expect(instance1).toBe(instance2)
    expect(resolver).toHaveBeenCalledTimes(1)
  })

  it('should bind and resolve a transient (factory)', () => {
    const resolver = vi.fn(() => ({ value: 'factoryValue' }))
    container.binding('factoryKey', resolver)

    const instance1 = container.make('factoryKey')
    const instance2 = container.make('factoryKey')

    expect(instance1).not.toBe(instance2)
    expect(resolver).toHaveBeenCalledTimes(2)
  })

  it('should throw an error when resolving an unbound key', () => {
    expect(() => container.make('unboundKey')).toThrow(ContainerError)
  })

  it('should set and resolve aliases', () => {
    container.instance('originalKey', 'originalValue')
    container.alias('originalKey', 'aliasKey')

    expect(container.make('aliasKey')).toBe('originalValue')
  })

  it('should throw an error if key equal to alias', () => {
    expect(() => container.alias('aliasKey', 'aliasKey')).toThrow(ContainerError)
  })

  it('should throw an error for aliasing an unbound key', () => {
    expect(() => container.alias('unboundKey', 'aliasKey')).toThrow(ContainerError)
  })

  it('should bind an instance only if not already bound', () => {
    container.instanceIf('testKey', 'initialValue')
    container.instanceIf('testKey', 'newValue')

    expect(container.make('testKey')).toBe('initialValue')
  })

  it('should bind a singleton only if not already bound', () => {
    const resolver1 = vi.fn(() => ({ value: 'singletonValue1' }))
    const resolver2 = vi.fn(() => ({ value: 'singletonValue2' }))

    container.singletonIf('singletonKey', resolver1)
    container.singletonIf('singletonKey', resolver2)

    const instance = container.make('singletonKey')
    expect(instance).toEqual({ value: 'singletonValue1' })
    expect(resolver1).toHaveBeenCalledTimes(1)
    expect(resolver2).not.toHaveBeenCalled()
  })

  it('should throw an error on circular dependencies', () => {
    container.singleton('A', (c) => c.make('B') ?? '')
    container.singleton('B', (c) => c.make('A') ?? '')

    expect(() => container.make('A')).toThrow(ContainerError)
  })

  it('should clear all bindings and aliases', () => {
    container.instance('testKey', 'testValue')
    container.alias('testKey', 'aliasKey')

    container.clear()

    expect(() => container.make('testKey')).toThrow(ContainerError)
    expect(container.isAlias('aliasKey')).toBe(false)
  })

  it('should retrieve all bindings', () => {
    container.instance('key1', 'value1')
    container.instance('key2', 'value2')
    const bindings = container.getBindings()

    expect(bindings.size).toBe(2)
    expect(bindings.get('key1')?.resolve(container)).toBe('value1')
    expect(bindings.get('key2')?.resolve(container)).toBe('value2')
  })

  it('should retrieve all aliases', () => {
    container.instance('key1', 'value1')
    container.alias('key1', 'alias1')
    container.alias('key1', 'alias2')
    const aliases = container.getAliases()

    expect(aliases.size).toBe(2)
    expect(aliases.get('alias1')).toBe('key1')
    expect(aliases.get('alias2')).toBe('key1')
  })

  it('should bind a resolver function if not already bound using bindingIf', () => {
    const resolver1 = vi.fn(() => ({ value: 'initialValue' }))
    const resolver2 = vi.fn(() => ({ value: 'newValue' }))

    container.bindingIf('bindingKey', resolver1)
    container.bindingIf('bindingKey', resolver2)

    const instance = container.make('bindingKey')
    expect(instance).toEqual({ value: 'initialValue' })
    expect(resolver1).toHaveBeenCalledTimes(1)
    expect(resolver2).not.toHaveBeenCalled()
  })

  it('should resolve a value, binding it if necessary', () => {
    /* eslint-disable-next-line @typescript-eslint/no-extraneous-class */
    class TestService {}
    /* eslint-disable-next-line @typescript-eslint/no-extraneous-class */
    class TestService2 {}
    container.autoBinding(TestService2, undefined, true, 'testService2')

    const instance = container.resolve(TestService, true)

    expect(instance).toBeInstanceOf(TestService)
    expect(instance).toEqual(container.make(TestService))
    expect(container.resolve(TestService2)).toBeInstanceOf(TestService2)
    expect((container as unknown as Record<string, TestService2>).testService2).toBeInstanceOf(TestService2)
  })

  it('should return a factory function that resolves the value', () => {
    container.instance('key1', 'value1')
    const factoryFn = container.factory('key1')

    expect(typeof factoryFn).toBe('function')
    expect(factoryFn()).toBe('value1')
  })

  it('should auto bind a value to the service container', () => {
    /* eslint-disable-next-line @typescript-eslint/no-extraneous-class */
    class TestService {}
    container.autoBinding('arrow', () => 'Jane')
    container.autoBinding('name', 'Jonh', false, 'testAlias')
    container.autoBinding('testService', TestService, false, 'testAlias')

    const instance = container.make('testService')
    expect(instance).toBeInstanceOf(TestService)
    expect(container.make('arrow')).toBe('Jane')
    expect(container.make('name')).toBe('Jonh')
    expect(container.isAlias('testAlias')).toBe(true)
    expect(container.make('testAlias')).toEqual(instance)
  })
})
