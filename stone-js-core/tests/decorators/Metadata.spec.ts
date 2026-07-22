import {
  setMetadata,
  hasMetadata,
  getMetadata,
  addMetadata,
  addBlueprint,
  hasBlueprint,
  getBlueprint,
  getAllMetadata,
  removeMetadata,
  MetadataSymbol,
  setClassMetadata,
  setFieldMetadata,
  setMethodMetadata
} from '../../src/decorators/Metadata'
import { SetupError } from '../../src/errors/SetupError'
import { BLUEPRINT_KEY } from '../../src/decorators/constants'
import { StoneBlueprint } from '../../src/options/StoneBlueprint'
import { ClassType, MetadataHolder } from '../../src/declarations'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mock Symbol.metadata for testing purposes
vi.hoisted(() => {
  (Symbol as any).metadata = Symbol.for('Symbol.metadata')
})

// Mock Class for testing purposes
const MockClass: ClassType & Partial<MetadataHolder> = class {}

MockClass[MetadataSymbol] = {}

// Mock context
const mockContext = { metadata: {} } as any

// Mock metadata key and value
const metadataKey = 'testKey'
const metadataValue = 'testValue'

// Mock blueprint
const mockBlueprint: StoneBlueprint = { stone: { name: 'testApp' } }

// Tests for metadata functions
describe('Metadata Utilities', () => {
  beforeEach(() => {
    mockContext.metadata = {}
  })

  it('should set metadata on context', () => {
    setMetadata(mockContext, metadataKey, metadataValue)
    expect(mockContext.metadata[metadataKey]).toBe(metadataValue)
  })

  it('should add metadata on context', () => {
    addMetadata(mockContext, metadataKey, metadataValue)
    addMetadata(mockContext, metadataKey, metadataValue)
    expect(mockContext.metadata[metadataKey]).toEqual([metadataValue, metadataValue])
  })

  it('should check if a class has specific metadata', () => {
    MockClass[MetadataSymbol] = { [metadataKey]: metadataValue }
    const result = hasMetadata(MockClass, metadataKey)
    expect(result).toBe(true)
  })

  it('should return metadata value for a given key', () => {
    const result = getMetadata(MockClass, metadataKey)
    const result2 = getMetadata(class {}, metadataKey, 'fallback')
    // @ts-expect-error - Testing legacy decorator as 2023-11 proposal decorator
    const result3 = getMetadata({ [MetadataSymbol]: { [metadataKey]: metadataValue } }, metadataKey)
    expect(result).toBe(metadataValue)
    expect(result2).toBe('fallback')
    expect(result3).toBe(metadataValue)
  })

  it('should return all metadata for a given class', () => {
    const result = getAllMetadata(MockClass, {})
    const result2 = getAllMetadata(class {}, { name: 'fallback' })
    expect(result).toBe(MockClass[MetadataSymbol])
    expect(result2).toEqual({ name: 'fallback' })
  })

  it('should remove specific metadata from a class', () => {
    removeMetadata(MockClass, metadataKey)
    expect(MockClass[MetadataSymbol]?.[metadataKey]).toBeUndefined()
  })

  it('is a no-op when the class has no own metadata symbol', () => {
    expect(() => removeMetadata(class {}, metadataKey)).not.toThrow()
  })

  it('should set class metadata using setClassMetadata', () => {
    const context = { kind: 'class', metadata: {} } as any
    // @ts-expect-error - Testing legacy decorator as 2023-11 proposal decorator
    setClassMetadata(metadataKey, metadataValue)(class {}, context)
    expect(context.metadata).toEqual({ [metadataKey]: metadataValue })
  })

  it('should throw an error when target is not a class', () => {
    const context = { metadata: {} } as any
    // @ts-expect-error - Testing legacy decorator as 2023-11 proposal decorator
    expect(() => setClassMetadata(metadataKey, metadataValue)(class {}, context)).toThrowError(SetupError)
  })

  it('should throw an error when it is not a 2023-11 decorators proposal', () => {
    const context = undefined
    // @ts-expect-error - Testing legacy decorator as 2023-11 proposal decorator
    expect(() => setClassMetadata(metadataKey, metadataValue)(class {}, context)).toThrowError(SetupError)
  })

  it('should set method metadata using setMethodMetadata', () => {
    const context = { kind: 'method', metadata: {} } as any
    // @ts-expect-error - Testing legacy decorator as 2023-11 proposal decorator
    setMethodMetadata(metadataKey, metadataValue)(() => {}, context)
    expect(context.metadata).toEqual({ [metadataKey]: metadataValue })
  })

  it('should throw an error when target is not a method', () => {
    const context = { metadata: {} } as any
    // @ts-expect-error - Testing legacy decorator as 2023-11 proposal decorator
    expect(() => setMethodMetadata(metadataKey, metadataValue)(() => {}, context)).toThrowError(SetupError)
  })

  it('should throw an error when setMethodMetadata gets no 2023-11 decorator context', () => {
    const context = undefined
    // @ts-expect-error - Testing legacy decorator as 2023-11 proposal decorator
    expect(() => setMethodMetadata(metadataKey, metadataValue)(() => {}, context)).toThrowError(SetupError)
  })

  it('should set field metadata using setFieldMetadata', () => {
    const context = { kind: 'field', metadata: {} } as any
    setFieldMetadata(metadataKey, metadataValue)(class {}, context)
    expect(context.metadata).toEqual({ [metadataKey]: metadataValue })
  })

  it('should throw an error when target is not a field', () => {
    const context = { metadata: {} } as any
    expect(() => setFieldMetadata(metadataKey, metadataValue)(class {}, context)).toThrowError(SetupError)
  })

  it('should throw an error when setFieldMetadata gets no 2023-11 decorator context', () => {
    const context = undefined
    // @ts-expect-error - Testing legacy decorator as 2023-11 proposal decorator
    expect(() => setFieldMetadata(metadataKey, metadataValue)(class {}, context)).toThrowError(SetupError)
  })

  it('should add blueprint to a class context', () => {
    MockClass[MetadataSymbol] = { [BLUEPRINT_KEY]: {} }
    addBlueprint(MockClass, mockContext, mockBlueprint)
    expect(mockContext.metadata[BLUEPRINT_KEY]).toEqual(mockBlueprint)
  })

  it('should check if a class has blueprint', () => {
    MockClass[MetadataSymbol] = { [BLUEPRINT_KEY]: mockBlueprint }
    const result = hasBlueprint(MockClass)
    expect(result).toBe(true)
  })

  it('should get blueprint from a class', () => {
    const result = getBlueprint(MockClass)
    const result2 = getBlueprint(class {}, { name: 'Stone.js' } as any)
    expect(result).toEqual(mockBlueprint)
    expect(result2).toEqual({ name: 'Stone.js' })
  })
})
