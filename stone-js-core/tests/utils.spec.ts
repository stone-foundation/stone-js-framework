import {
  isEmpty,
  isNotEmpty,
  isMetaModule,
  mergeBlueprints,
  isFunctionModule,
  isStoneBlueprint,
  isHandlerHasHook,
  isMetaClassModule,
  isMetaAliasModule,
  validateBlueprints,
  isObjectLikeModule,
  isMetaFactoryModule,
  isClassConstructor,
  isMetaFunctionModule
} from '../src/utils'
import { SetupError } from '../src/errors/SetupError'

describe('utils', () => {
  describe('mergeBlueprints', () => {
    it('should merge multiple blueprint objects', () => {
      const blueprint1 = { stone: { version: '1.0.0' }, name: 'a' }
      const blueprint2 = { stone: { debug: true }, other: 123 }

      const merged = mergeBlueprints(blueprint1, blueprint2)

      expect(merged).toEqual({
        stone: {
          version: '1.0.0',
          debug: true
        },
        name: 'a',
        other: 123
      })
    })

    it('should return an empty blueprint if none provided', () => {
      const merged = mergeBlueprints()
      expect(merged).toEqual({ stone: {} })
    })

    it('should throw SetupError on invalid input (null)', () => {
      expect(() => mergeBlueprints(null as any)).toThrow(SetupError)
    })

    it('should throw SetupError on invalid input (non-object)', () => {
      expect(() => mergeBlueprints('not-an-object' as any)).toThrow(SetupError)
    })
  })

  describe('validateBlueprints', () => {
    it('should not throw if all inputs are valid objects', () => {
      expect(() => validateBlueprints([{ stone: {} }, {}])).not.toThrow()
    })

    it('should throw SetupError on invalid entry', () => {
      expect(() => validateBlueprints([null as any, {}])).toThrow(SetupError)
      expect(() => validateBlueprints([undefined as any])).toThrow(SetupError)
    })
  })

  describe('isStoneBlueprint', () => {
    it('should return true if object has .stone key', () => {
      expect(isStoneBlueprint({ stone: {} })).toBe(true)
    })

    it('should return false if .stone is missing or not object', () => {
      expect(isStoneBlueprint({})).toBe(false)
      expect(isStoneBlueprint({ stone: undefined })).toBe(false)
      expect(isStoneBlueprint(null)).toBe(false)
    })
  })

  describe('meta module type guards', () => {
    it('should detect object-like modules', () => {
      expect(isObjectLikeModule({ a: 1 })).toBe(true)
      expect(isObjectLikeModule(null)).toBe(false)
      expect(isObjectLikeModule(42)).toBe(false)
    })

    it('should detect function modules', () => {
      expect(isFunctionModule(() => {})).toBe(true)
      expect(isFunctionModule(function () {})).toBe(true)
      expect(isFunctionModule('not a function')).toBe(false)
    })

    it('should detect meta modules with function module', () => {
      expect(isMetaModule({ module: () => {} })).toBe(true)
      expect(isMetaModule({ module: 'nope' })).toBe(false)
      expect(isMetaModule({})).toBe(false)
    })

    it('should detect meta function modules', () => {
      const fn = (): void => {}
      expect(isMetaFunctionModule({ module: fn })).toBe(true)
      expect(isMetaFunctionModule({ module: fn, isClass: false })).toBe(true)
      expect(isMetaFunctionModule({ module: fn, isFactory: false })).toBe(true)
      expect(isMetaFunctionModule({ module: fn, isClass: true })).toBe(false)
      expect(isMetaFunctionModule({ module: 'nope' })).toBe(false)
    })

    it('should detect meta class modules', () => {
      class Cls {
        handle (): void {}
      }
      expect(isMetaClassModule({ module: Cls, isClass: true })).toBe(true)
      expect(isMetaClassModule({ module: Cls, isClass: false })).toBe(false)
      expect(isMetaClassModule({ module: () => {}, isClass: true })).toBe(false)
    })

    it('should detect meta factory modules', () => {
      const factory = (): void => {}
      expect(isMetaFactoryModule({ module: factory, isFactory: true })).toBe(true)
      expect(isMetaFactoryModule({ module: factory, isFactory: false })).toBe(false)
      expect(isMetaFactoryModule({ module: 'nope', isFactory: true })).toBe(false)
    })

    it('should detect meta alias modules', () => {
      const alias = (): void => {}
      expect(isMetaAliasModule({ module: alias, isAlias: true })).toBe(true)
      expect(isMetaAliasModule({ module: alias, isAlias: false })).toBe(false)
      expect(isMetaAliasModule({ module: 'bad', isAlias: true })).toBe(false)
    })
  })

  describe('isClassConstructor', () => {
    it('detects a real class via the `class` keyword', () => {
      class Foo {}
      expect(isClassConstructor(Foo)).toBe(true)
    })

    it('detects a class-like function by its prototype methods', () => {
      function Bar (this: any): void {}
      Bar.prototype.method = function (): void {}
      expect(isClassConstructor(Bar)).toBe(true)
    })

    it('rejects plain/factory functions and non-functions', () => {
      expect(isClassConstructor(() => ({}))).toBe(false)
      expect(isClassConstructor(function factory () { return {} })).toBe(false)
      expect(isClassConstructor(42)).toBe(false)
      expect(isClassConstructor(null)).toBe(false)
    })
  })

  describe('isHandlerHasHook', () => {
    it('should return true if handler has the specified hook as a function', () => {
      const handler = {
        onInit: () => 'called'
      }

      const result = isHandlerHasHook<typeof handler>(handler, 'onInit')

      expect(result).toBe(true)
    })

    it('should return false if hook is missing', () => {
      const handler = {}

      // @ts-expect-error: testing missing hook
      const result = isHandlerHasHook<typeof handler>(handler, 'onTerminate')

      expect(result).toBe(false)
    })

    it('should return false if hook is not a function', () => {
      const handler = {
        onInit: 'not-a-function'
      }

      const result = isHandlerHasHook<typeof handler>(handler, 'onInit')

      expect(result).toBe(false)
    })

    it('should return false if handler is null or undefined', () => {
      expect(isHandlerHasHook(null, 'onInit')).toBe(false)
      expect(isHandlerHasHook(undefined, 'onInit')).toBe(false)
    })
  })

  describe('isEmpty / isNotEmpty', () => {
    it('should return true for nullish and falsy values', () => {
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(0)).toBe(true)
      expect(isEmpty(false)).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isNotEmpty({})).toBe(false)
      expect(isNotEmpty({ name: '' })).toBe(true)
      expect(isNotEmpty(new Date())).toBe(true)
      expect(isNotEmpty(new Error())).toBe(true)
    })

    it('should return false for truthy primitives', () => {
      expect(isEmpty(true)).toBe(false)
      expect(isEmpty(123)).toBe(false)
      expect(isEmpty('text')).toBe(false)
    })

    it('should return true for empty arrays and strings', () => {
      expect(isEmpty([])).toBe(true)
      expect(isEmpty('')).toBe(true)
    })

    it('should return false for non-empty arrays and strings', () => {
      expect(isEmpty(['a'])).toBe(false)
      expect(isEmpty('abc')).toBe(false)
    })

    it('should return true for empty objects', () => {
      expect(isEmpty({})).toBe(true)
    })

    it('should return false for objects with keys', () => {
      expect(isEmpty({ key: 'value' })).toBe(false)
    })

    it('should return false for objects with symbols', () => {
      const sym = Symbol('x')
      const obj = { [sym]: 'hidden' }

      expect(isEmpty(obj)).toBe(false)
    })

    it('should return true for empty Maps and Sets', () => {
      expect(isEmpty(new Map())).toBe(true)
      expect(isEmpty(new Set())).toBe(true)
    })

    it('should return false for non-empty Maps and Sets', () => {
      const map = new Map()
      map.set('a', 1)

      const set = new Set()
      set.add(42)

      expect(isEmpty(map)).toBe(false)
      expect(isEmpty(set)).toBe(false)
    })

    it('isNotEmpty should return exact inverse of isEmpty', () => {
      const samples = [undefined, null, '', 0, false, [], {}, new Map(), new Set(), 'value', [1], { a: 1 }]
      for (const val of samples) {
        expect(isNotEmpty(val)).toBe(!isEmpty(val))
      }
    })
  })

  describe('isMergeable behavior via mergeBlueprints', () => {
    it('should merge normal nested objects deeply', () => {
      const a = { stone: {}, deep: { x: 1 } }
      const b = { deep: { y: 2 } }

      const merged = mergeBlueprints(a, b)

      expect(merged.deep).toEqual({ x: 1, y: 2 })
    })

    it('should skip merging non-object values', () => {
      const merged = mergeBlueprints(
        { stone: {}, version: '1.0.0' },
        { version: null }
      )

      expect(merged.version).toBe(null)
    })
  })
})
