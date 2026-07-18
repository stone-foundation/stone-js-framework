import * as Env from '../src/Env'
import { EnvError } from '../src/EnvError'

describe('Env class', () => {
  // Mocking process.env for testing purposes
  beforeEach(() => {
    globalThis.window = undefined as any
    process.env = {
      ...process.env,
      TEST_STRING: 'Hello',
      TEST_NUMBER: '42',
      TEST_BOOLEAN_TRUE: 'true',
      TEST_BOOLEAN_FALSE: 'false',
      TEST_ARRAY: 'one,two,three',
      TEST_OBJECT: 'key1:value1,key2:42,key3:true',
      TEST_JSON: '{"name":"John", "age":30}',
      TEST_BAD_JSON: '{"name""John", "age":30}',
      TEST_ENUM: 'option1',
      TEST_EMAIL: 'test@example.com',
      TEST_URL: 'https://example.com',
      TEST_HOST: 'https://example.com',
      TEST_IP: '192.168.0.1'
    }
    Env.clearCache()
  })

  describe('get items', () => {
    it('get string value', () => {
      expect(Env.get('TEST_STRING')).toBe('Hello')
    })

    it('get string value with callback', () => {
      expect(Env.get('TEST_STRING', (_: string, value: string) => value)).toBe('Hello')
    })

    it('get number value', () => {
      expect(Env.get('TEST_NUMBER', { type: 'number' })).toBe(42)
    })

    it('get boolean value (true)', () => {
      expect(Env.get('TEST_BOOLEAN_TRUE', { type: 'boolean' })).toBe(true)
    })

    it('get boolean value (false)', () => {
      expect(Env.get('TEST_BOOLEAN_FALSE', { type: 'boolean' })).toBe(false)
    })

    it('get array value', () => {
      expect(Env.get('TEST_ARRAY', { type: 'array' })).toEqual(['one', 'two', 'three'])
    })

    it('get object value', () => {
      expect(Env.get('TEST_OBJECT', { type: 'object' })).toEqual({ key1: 'value1', key2: 42, key3: true })
    })

    it('get JSON value', () => {
      expect(Env.get('TEST_JSON', { type: 'json' })).toEqual({ name: 'John', age: 30 })
    })

    it('get default on bad JSON value', () => {
      expect(Env.getJson('TEST_BAD_JSON', { default: { name: 'John' } })).toEqual({ name: 'John' })
    })

    it('get enum value', () => {
      expect(Env.getEnum('TEST_ENUM', ['option1', 'option2'])).toBe('option1')
    })

    it('get email value', () => {
      expect(Env.get('TEST_EMAIL', { type: 'email' })).toBe('test@example.com')
    })

    it('get URL value', () => {
      expect(Env.get('TEST_URL', { type: 'url' })).toBe('https://example.com')
    })

    it('get host value (IP)', () => {
      expect(Env.get('TEST_IP', { type: 'host', version: 4 })).toBe('192.168.0.1')
    })

    it('handle missing value with default', () => {
      expect(Env.get('MISSING_KEY', { default: 'defaultValue' })).toBe('defaultValue')
    })

    it('getEnv from browser', () => {
      globalThis.window = { process: { env: { TEST_STRING: 'Hello' } } } as any
      expect(Env.get('TEST_STRING', { type: 'string' })).toBe('Hello')
    })

    it('throw error for missing required value', () => {
      expect(() => Env.get('MISSING_KEY', { optional: false })).toThrow('Value for MISSING_KEY is required.')
    })

    it('throw error for empty required value', () => {
      process.env.TEST_EMPTY = '  '
      expect(() => Env.get('TEST_EMPTY', { optional: false })).toThrow('Value for TEST_EMPTY is required.')
    })

    it('cache works correctly', () => {
      process.env.CACHE_TEST = 'cachedValue'
      expect(Env.get('CACHE_TEST')).toBe('cachedValue')
      process.env.CACHE_TEST = 'newValue'
      expect(Env.get('CACHE_TEST')).toBe('cachedValue') // Should still return the cached value
    })

    it('clear cache', () => {
      process.env.CACHE_TEST = 'cachedValue'
      Env.get('CACHE_TEST')
      Env.clearCache()
      process.env.CACHE_TEST = 'newValue'
      expect(Env.get('CACHE_TEST')).toBe('newValue') // Should return the updated value after cache is cleared
    })
  })

  describe('custom', () => {
    it('custom validator', () => {
      const customValidator = (key: string, value: string | undefined): string => {
        if (value !== 'customValue') {
          throw new EnvError(`Value for ${key} must be 'customValue'.`)
        }
        return value
      }
      process.env.TEST_CUSTOM = 'customValue'
      expect(Env.custom('TEST_CUSTOM', customValidator)).toBe('customValue')
    })
  })

  describe('getString', () => {
    it('should return the default value when the key does not exist', () => {
      expect(Env.getString('MISSING_KEY', { format: 'email', default: 'Default Value' })).toBe('Default Value')
      expect(Env.getString('MISSING_KEY', { format: 'host', default: 'Default Value' })).toBe('Default Value')
      expect(Env.getString('MISSING_KEY', { format: 'url', default: 'Default Value' })).toBe('Default Value')
    })

    it('should throw an error when an invalid URL is provided with url format', () => {
      process.env.INVALID_URL = 'not-a-url'
      expect(() => Env.getString('INVALID_URL', { format: 'url' })).toThrow('Value for INVALID_URL must be a valid URL.')
    })

    it('should throw an error when an invalid host is provided with host format', () => {
      process.env.INVALID_HOST = 'not-a-host'
      expect(() => Env.getString('INVALID_HOST', { format: 'host' })).toThrow('Value for INVALID_HOST must be a valid host (URL or IP).')
    })

    it('should throw an error when an invalid email is provided with email format', () => {
      process.env.INVALID_EMAIL = 'not-an-email'
      expect(() => Env.getString('INVALID_EMAIL', { format: 'email' })).toThrow('Value for INVALID_EMAIL must be a valid email address.')
    })
  })

  describe('getNumber', () => {
    it('should return the default value when the key does not exist', () => {
      expect(Env.getNumber('MISSING_KEY', { default: '55' })).toBe(55)
    })

    it('should throw an error when an invalid number is provided', () => {
      process.env.TEST_NUMBER = 'not-a-number'
      expect(() => Env.getNumber('TEST_NUMBER')).toThrow('Value for TEST_NUMBER must be a valid number')
    })
  })

  describe('getBoolean', () => {
    it('should throw an error when an invalid boolean is provided', () => {
      process.env.TEST_BOOLEAN = 'not-a-boolean'
      expect(() => Env.getBoolean('TEST_BOOLEAN')).toThrow('Value for TEST_BOOLEAN must be a valid boolean')
    })
  })

  describe('getArray', () => {
    it('should return the default value when the key does not exist', () => {
      expect(Env.getArray('MISSING_KEY', { default: [12] })).toEqual([12])
    })
  })

  describe('getObject', () => {
    it('should return the default value when the key does not exist', () => {
      expect(Env.getObject('MISSING_KEY', { default: { key: 'value' } })).toEqual({ key: 'value' })
    })
  })

  describe('getJson', () => {
    it('should return the default value when the key does not exist', () => {
      expect(Env.getJson('MISSING_KEY', { default: '55' })).toBe('55')
    })

    it('should throw an error when an invalid json is provided', () => {
      process.env.TEST_JSON = '{ "lll:ppp }'
      expect(() => Env.getJson('TEST_JSON')).toThrow(EnvError)
    })
  })

  describe('getEnum', () => {
    it('should throw an error if the value is not one of the allowed enum values and optional is false', () => {
      process.env.TEST_ENUM = 'invalidOption'
      expect(() => Env.getEnum('TEST_ENUM', ['option1', 'option2'])).toThrow(
        'Value for TEST_ENUM must be one of: option1,option2.'
      )
    })

    it('should return the default value if the key does not exist and default is provided', () => {
      expect(Env.getEnum('MISSING_KEY', ['option1', 'option2'], 'defaultValue')).toBe('defaultValue')
    })

    it('should return the value if options is provided as an object', () => {
      process.env.TEST_ENUM = 'option2'
      const options = { enums: ['option1', 'option2'], optional: false }
      expect(Env.getEnum('TEST_ENUM', options)).toBe('option2')
    })
  })

  describe('isProd', () => {
    it('should return true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production'
      expect(Env.isProd()).toBe(true)
    })

    it('should return true when NODE_ENV is prod', () => {
      process.env.NODE_ENV = 'prod'
      expect(Env.isProd()).toBe(true)
    })

    it('should return false when NODE_ENV is not production or prod', () => {
      process.env.NODE_ENV = 'development'
      expect(Env.isProd()).toBe(false)
    })
  })

  describe('isNotProd', () => {
    it('should return true when NODE_ENV is not production or prod', () => {
      process.env.NODE_ENV = 'development'
      expect(Env.isNotProd()).toBe(true)
    })

    it('should return false when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production'
      expect(Env.isNotProd()).toBe(false)
    })

    it('should return false when NODE_ENV is prod', () => {
      process.env.NODE_ENV = 'prod'
      expect(Env.isNotProd()).toBe(false)
    })
  })

  describe('isTesting', () => {
    it('should return true when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test'
      expect(Env.isTesting()).toBe(true)
    })

    it('should return true when NODE_ENV is testing', () => {
      process.env.NODE_ENV = 'testing'
      expect(Env.isTesting()).toBe(true)
    })

    it('should return false when NODE_ENV is not test or testing', () => {
      process.env.NODE_ENV = 'production'
      expect(Env.isTesting()).toBe(false)
    })
  })
})
