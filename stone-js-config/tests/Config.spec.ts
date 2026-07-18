import { Config } from '../src/Config'

describe('Config', () => {
  let config: Config<any>

  beforeEach(() => {
    config = Config.create({
      setting1: 'value1',
      setting2: 'value2',
      nested: {
        key: 'nestedValue'
      }
    })
  })

  it('should create a Config instance with initial values', () => {
    expect((config as any).setting1).toBe('value1')
    expect(config.get('setting2')).toBe('value2')
    expect(config.get('nested.key')).toBe('nestedValue')
  })

  it('should get a configuration value with a fallback', () => {
    expect(config.get('nonExistentKey', 'defaultValue')).toBe('defaultValue')
    expect(config.getMany({ key: 'defaultValue' })).toEqual({ key: 'defaultValue' })
    expect(config.firstMatch(['nonExistent', 'nonExistent2'], 'default')).toBe('default')
  })

  it('should get the first match value', () => {
    expect(config.firstMatch(['nonExistent', 'setting2'], 'default')).toBe('value2')
  })

  it('should get multiple configuration values', () => {
    const result = config.getMany(['setting1', 'nested.key'])
    expect(result).toEqual({
      setting1: 'value1',
      'nested.key': 'nestedValue'
    })
  })

  it('should determine if a configuration value exists', () => {
    expect(config.has('setting1')).toBe(true)
    expect(config.has('nonExistent')).toBe(false)
  })

  it('should determine if a configuration value does not exist', () => {
    expect(config.hasNot('nonExistent')).toBe(true)
    expect(config.hasNot('setting1')).toBe(false)
  })

  it('should set a new configuration value', () => {
    config.set('setting3', 'value3')
    expect(config.get('setting3')).toBe('value3')
  })

  it('should merge pojo when already exist', () => {
    config.set({ nested: { key2: 'newValue' } })
    expect(config.get('nested')).toEqual({ key: 'nestedValue', key2: 'newValue' })
  })

  it('should set multiple configuration values', () => {
    config.set({ setting4: 'value4', setting5: 'value5' })
    expect(config.get('setting4')).toBe('value4')
    expect(config.get('setting5')).toBe('value5')
  })

  it('should merge object value when exists', () => {
    config.add('nested', { key2: ['default6'] })
    config.add('nested.key2', 'default7')
    expect(config.get('nested')).toEqual({ key: 'nestedValue', key2: ['default6', 'default7'] })
    config.add('setting1', 'newDefault')
    expect(config.get('setting1')).toBe('newDefault')
  })

  it('should return all configuration items', () => {
    expect(config.all()).toEqual({
      setting1: 'value1',
      setting2: 'value2',
      nested: {
        key: 'nestedValue'
      }
    })
  })

  it('should clear all configuration items', () => {
    config.clear()
    expect(config.all()).toEqual({})
  })

  it('should create a Config instance from JSON string', () => {
    const json = JSON.stringify({ setting: 'jsonValue' })
    const jsonConfig = Config.fromJson(json)
    expect(jsonConfig.get('setting')).toBe('jsonValue')
  })

  it('should return true if the value matches using is()', () => {
    expect(config.is('setting1', 'value1')).toBe(true)
    expect(config.is('setting1', 'wrongValue')).toBe(false)
  })

  it('should return false if the value does not match using isNot()', () => {
    expect(config.isNot('setting1', 'value1')).toBe(false)
    expect(config.isNot('setting1', 'wrongValue')).toBe(true)
  })

  it('should not overwrite existing key with setIf', () => {
    config.setIf('setting1', 'newValue')
    expect(config.get('setting1')).toBe('value1') // original remains
  })

  it('should set key if it does not exist with setIf', () => {
    config.setIf('newKey', 'newValue')
    expect(config.get('newKey')).toBe('newValue')
  })

  it('should replace all items with setItems()', () => {
    config.setItems({ newSetting: 123 })
    expect(config.get('newSetting')).toBe(123)
    expect(config.get('setting1')).toBeUndefined()
  })

  it('should serialize configuration to JSON string', () => {
    expect(config.toJson()).toBe(JSON.stringify(config.all()))
  })

  it('should fallback to get() via proxy when accessing undefined property', () => {
    expect((config as any)['nested.key']).toBe('nestedValue') // triggers get('nested.key')
    expect((config as any).nonExisting).toBeUndefined()
  })
})
