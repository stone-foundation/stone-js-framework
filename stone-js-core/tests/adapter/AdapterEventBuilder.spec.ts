import { IntegrationError } from '../../src/errors/IntegrationError'
import { AdapterEventBuilder } from '../../src/adapter/AdapterEventBuilder'

describe('AdapterEventBuilder', () => {
  interface TestOptions {
    foo?: string
    bar?: number
  }

  const defaultResolver = (opts: TestOptions): unknown => ({ ...opts, resolved: true })

  it('should create a builder with initial options', () => {
    const builder = AdapterEventBuilder.create<TestOptions, any>({ options: { foo: 'abc' }, resolver: defaultResolver })
    expect(builder.options.foo).toBe('abc')
  })

  it('should throw if resolver is not provided', () => {
    expect(() => {
      // @ts-expect-error
      AdapterEventBuilder.create({ options: { foo: 'abc' } })
    }).toThrow(IntegrationError)
  })

  it('should add a key-value pair using add()', () => {
    const builder = AdapterEventBuilder.create<TestOptions, any>({ resolver: defaultResolver })
    builder.add('foo', 'bar')
    expect(builder.options.foo).toBe('bar')
  })

  it('should conditionally add a value using addIf() only if key is empty', () => {
    const builder = AdapterEventBuilder.create<TestOptions, any>({ resolver: defaultResolver })

    builder.addIf('foo', 'added') // Should add
    expect(builder.options.foo).toBe('added')

    builder.addIf('foo', 'ignored') // Should ignore
    expect(builder.options.foo).toBe('added')
  })

  it('should call the resolver with current options on build()', () => {
    const customResolver = vi.fn().mockImplementation((opts: TestOptions) => ({ ...opts, built: true }))
    const builder = AdapterEventBuilder.create<TestOptions, any>({ options: { foo: 'hello' }, resolver: customResolver })
    const result = builder.build()
    expect(result.foo).toBe('hello')
    expect(result.built).toBe(true)
    expect(customResolver).toHaveBeenCalledWith({ foo: 'hello' })
  })
})
