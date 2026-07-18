import { Proxiable } from '../src/Proxiable'

describe('Proxiable', () => {
  class TestProxiable extends Proxiable {
    public value: string

    constructor (handler: ProxyHandler<TestProxiable>, value: string) {
      super(handler)
      this.value = value
    }
  }

  it('should create a proxy-wrapped instance with custom handler behaviors', () => {
    const handler: ProxyHandler<TestProxiable> = {
      get (target, prop) {
        if (prop === 'value') {
          return 'proxiedValue'
        }
        return Reflect.get(target, prop)
      }
    }

    const instance = new TestProxiable(handler, 'originalValue')
    expect(instance.value).toBe('proxiedValue')
  })

  it('should allow access to other properties normally', () => {
    const handler: ProxyHandler<TestProxiable> = {}
    const instance = new TestProxiable(handler, 'normalValue')
    expect(instance.value).toBe('normalValue')
  })

  it('should allow defining custom behavior for setting properties', () => {
    const handler: ProxyHandler<TestProxiable> = {
      set (target, prop, value) {
        if (prop === 'value') {
          target[prop as keyof TestProxiable] = `modified_${String(value)}`
          return true
        }
        return Reflect.set(target, prop, value)
      }
    }

    const instance = new TestProxiable(handler, 'initialValue')
    instance.value = 'newValue'
    expect(instance.value).toBe('modified_newValue')
  })
})
