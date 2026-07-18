import { MetaPipe, FunctionalPipe } from '../src/declarations'
import { defineMiddleware, isConstructor, isFunction, isFunctionPipe, isString } from '../src/utils'

describe('defineMiddleware', () => {
  it('should define middleware with provided pipe and options', () => {
    const module: FunctionalPipe<number, string> = (value) => value.toString()
    const options: Omit<MetaPipe<number, string>, 'module'> = { isClass: true, priority: 1, params: [1] }

    const result = defineMiddleware(module, options)

    expect(result).toEqual({ ...options, module })
  })

  it('should define middleware with pipe and no options', () => {
    const module: FunctionalPipe<number, string> = (value) => value.toString()

    const result = defineMiddleware(module)

    expect(result).toEqual({ module })
  })
})

describe('isString', () => {
  it('should return true for strings', () => {
    expect(isString('hello')).toBe(true)
    expect(isString('')).toBe(true)
  })

  it('should return false for non-strings', () => {
    expect(isString(123)).toBe(false)
    expect(isString(null)).toBe(false)
    expect(isString(undefined)).toBe(false)
    expect(isString({})).toBe(false)
    expect(isString([])).toBe(false)
    expect(isString(() => {})).toBe(false)
  })
})

describe('isFunction', () => {
  it('should return true for functions', () => {
    expect(isFunction(() => {})).toBe(true)
    expect(isFunction(function () {})).toBe(true)
    expect(isFunction(async () => {})).toBe(true)
    expect(isFunction(class { handle (): string { return 'Testing' } })).toBe(true) // Classes are functions in JS
  })

  it('should return false for non-functions', () => {
    expect(isFunction(123)).toBe(false)
    expect(isFunction('hello')).toBe(false)
    expect(isFunction(null)).toBe(false)
    expect(isFunction(undefined)).toBe(false)
    expect(isFunction({})).toBe(false)
    expect(isFunction([])).toBe(false)
  })
})

describe('isConstructor', () => {
  it('should return true for class and function', () => {
    expect(isConstructor(function () {})).toBe(true) // As function is a constructor
    expect(isConstructor(class { handle (): string { return 'Testing' } })).toBe(true)
  })

  it('should return false for non-constructor', () => {
    expect(isConstructor(123)).toBe(false)
    expect(isConstructor('hello')).toBe(false)
    expect(isConstructor(null)).toBe(false)
    expect(isConstructor(undefined)).toBe(false)
    expect(isConstructor({})).toBe(false)
    expect(isConstructor([])).toBe(false)
    expect(isConstructor(() => {})).toBe(false) // As Arrow function is not a constructor
    expect(isConstructor(async () => {})).toBe(false) // As Arrow function is not a constructor
  })
})

describe('isFunctionPipe', () => {
  it('should return true for function pipe', () => {
    expect(isFunctionPipe({ module: () => {} })).toBe(true)
    expect(isFunctionPipe({ module: function () {} })).toBe(true)
  })

  it('should return false for non-function pipe', () => {
    expect(isFunctionPipe({ module: 'alias', isAlias: true })).toBe(false)
    expect(isFunctionPipe({ module: () => {}, isFactory: true })).toBe(false)
    expect(isFunctionPipe({ module: class { handle (): string { return 'Testing' } }, isClass: true })).toBe(false)
  })
})
