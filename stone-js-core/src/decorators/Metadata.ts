import { BLUEPRINT_KEY } from './constants'
import { SetupError } from '../errors/SetupError'
import { IncomingEvent } from '../events/IncomingEvent'
import { StoneBlueprint } from '../options/StoneBlueprint'
import { OutgoingResponse } from '../events/OutgoingResponse'
import { isFunctionModule, isNotEmpty, isObjectLikeModule, mergeBlueprints } from '../utils'
import { ClassType, MetadataHolder, ProposalClassDecorator, ProposalMethodDecorator, ProposalPropertyDecorator, MetadataKey } from '../declarations'

/**
 * A unique symbol for storing and accessing metadata on classes and their members.
 * This symbol is used by decorators to define and retrieve metadata across modules.
 */
export const MetadataSymbol: MetadataKey = (Symbol.metadata !== undefined
  ? Symbol.metadata
  : Symbol.for('Symbol.metadata')
) as MetadataKey

/**
 * Set metadata on a given decorator context.
 *
 * @param context - The decorator context where metadata is being set.
 * @param key - The key for the metadata entry.
 * @param value - The value of the metadata entry.
 */
export function setMetadata (context: DecoratorContext, key: PropertyKey, value: unknown): void {
  context.metadata[key] = value
}

/**
 * Add metadata on a given decorator context.
 *
 * @param context - The decorator context where metadata is being added.
 * @param key - The key for the metadata entry.
 * @param value - The value of the metadata entry.
 */
export function addMetadata (context: DecoratorContext, key: PropertyKey, value: unknown): void {
  context.metadata[key] = [value].concat(context.metadata[key] ?? [])
}

/**
 * Check if a class has specific metadata.
 *
 * @param Class - The class to check for metadata.
 * @param key - The key of the metadata to check.
 * @returns True if the metadata key exists on the class, false otherwise.
 */
export function hasMetadata<T extends ClassType> (Class: T, key: PropertyKey): boolean {
  return hasMetadataSymbol(Class) && Class[MetadataSymbol]?.[key] !== undefined
}

/**
 * Get the metadata value for a given key from a class.
 *
 * @param Class - The class to get the metadata from.
 * @param key - The key of the metadata to retrieve.
 * @returns The metadata value or the default value if the key does not exist.
 */
export function getMetadata<TClass extends ClassType, UReturn = unknown> (Class: TClass, key: PropertyKey): UReturn | undefined

/**
 * Get the metadata value for a given key from a class.
 *
 * @param Class - The class to get the metadata from.
 * @param key - The key of the metadata to retrieve.
 * @param fallback - The default value to return if the metadata key is not found.
 * @returns The metadata value or the default value if the key does not exist.
 */
export function getMetadata<TClass extends ClassType, UReturn = unknown> (Class: TClass, key: PropertyKey, fallback: UReturn): UReturn

/**
 * Get the metadata value for a given key from a class.
 *
 * @param Class - The class to get the metadata from.
 * @param key - The key of the metadata to retrieve.
 * @param fallback - The default value to return if the metadata key is not found.
 * @returns The metadata value or the default value if the key does not exist.
 */
export function getMetadata<TClass extends ClassType, UReturn = unknown> (Class: TClass, key: PropertyKey, fallback?: UReturn): UReturn | undefined {
  const value = hasMetadataSymbol(Class) ? Class[MetadataSymbol]?.[key] : undefined
  // Fall back whenever the key is absent — even if the class carries other metadata.
  return (value ?? fallback) as UReturn | undefined
}

/**
 * Get all metadata from a class.
 *
 * @param Class - The class to get all metadata from.
 * @returns All metadata or the default value if no metadata exists.
 */
export function getAllMetadata<TClass extends ClassType, UReturn = unknown> (Class: TClass): UReturn | undefined

/**
 * Get all metadata from a class.
 *
 * @param Class - The class to get all metadata from.
 * @param fallback - The default value to return if no metadata is found.
 * @returns All metadata or the default value if no metadata exists.
 */
export function getAllMetadata<TClass extends ClassType, UReturn = unknown> (Class: TClass, fallback: UReturn): UReturn

/**
 * Get all metadata from a class.
 *
 * @param Class - The class to get all metadata from.
 * @param fallback - The default value to return if no metadata is found.
 * @returns All metadata or the default value if no metadata exists.
 */
export function getAllMetadata<TClass extends ClassType, UReturn = unknown> (Class: TClass, fallback?: UReturn): UReturn | undefined {
  return (hasMetadataSymbol(Class) ? Class[MetadataSymbol] : fallback) as UReturn | undefined
}

/**
 * Remove a specific metadata entry from a class.
 *
 * @param Class - The class to remove metadata from.
 * @param key - The key of the metadata to remove.
 */
export function removeMetadata<T extends ClassType> (Class: T, key: PropertyKey): void {
  if (!hasMetadataSymbol(Class)) { return }

  // Only mutate metadata the class OWNS. An undecorated subclass reaches its parent's
  // metadata object through the prototype chain; mutating it there would corrupt the
  // parent (and every sibling). In that case there is nothing of this class's own to remove.
  if (!Object.hasOwn(Class, MetadataSymbol)) { return }

  const metadata = Class[MetadataSymbol]
  if (metadata?.[key] !== undefined) {
    /* eslint-disable-next-line @typescript-eslint/no-dynamic-delete */
    delete metadata[key]
  }
}

/**
 * Set metadata on a class using a class decorator.
 *
 * @param key - The key for the metadata entry.
 * @param value - The value of the metadata entry.
 * @returns A class decorator function that sets the metadata.
 */
export function setClassMetadata<T extends ClassType = ClassType> (key: PropertyKey, value: unknown): ClassDecorator {
  return classDecoratorLegacyWrapper((_target: T, context: ClassDecoratorContext<T>): undefined => {
    setMetadata(context, key, value)
  })
}

/**
 * Set metadata on a class method using a method decorator.
 *
 * @param key - The key for the metadata entry.
 * @param value - The value of the metadata entry.
 * @returns A method decorator function that sets the metadata.
 */
export function setMethodMetadata<T extends Function = Function> (key: PropertyKey, value: unknown): MethodDecorator {
  return methodDecoratorLegacyWrapper((_target: T, context: ClassMethodDecoratorContext<T>): undefined => {
    setMetadata(context as ClassMethodDecoratorContext, key, value)
  })
}

/**
 * Set metadata on a class field using a field decorator.
 *
 * @param key - The key for the metadata entry.
 * @param value - The value of the metadata entry.
 * @returns A field decorator function that sets the metadata.
 */
export function setFieldMetadata (key: PropertyKey, value: unknown): PropertyDecorator {
  return propertyDecoratorLegacyWrapper((_target: undefined, context: ClassFieldDecoratorContext): ((initialValue: unknown) => unknown) => {
    setMetadata(context, key, value)
    return (initialValue: unknown): unknown => initialValue
  })
}

/**
 * Add Blueprint on a given decorator context.
 *
 * @param _Class - The class to get all metadata from.
 * @param context - The decorator context where metadata is being set.
 * @param blueprints - The list of blueprints.
 */
export function addBlueprint<
  T extends ClassType,
  U extends IncomingEvent = IncomingEvent,
  V extends OutgoingResponse = OutgoingResponse
> (_Class: T, context: DecoratorContext, ...blueprints: Array<StoneBlueprint<U, V> | Record<string, any>>): void {
  context.metadata[BLUEPRINT_KEY] = mergeBlueprints((context.metadata[BLUEPRINT_KEY] ?? { stone: {} }) as StoneBlueprint<U, V>, ...blueprints)
}

/**
 * Check if a class has blueprint.
 *
 * @param Class - The class to check for metadata.
 * @returns True if the metadata and BLUEPRINT_KEY keys exist on the class, false otherwise.
 */
export function hasBlueprint<T extends ClassType> (Class: T): boolean {
  return hasMetadataSymbol(Class) && Class[MetadataSymbol]?.[BLUEPRINT_KEY] !== undefined
}

/**
 * Get the blueprint value from a class.
 *
 * @param Class - The class to get the blueprint from.
 * @returns The blueprint value or the default value if the key does not exist.
 */
export function getBlueprint<TClass extends ClassType, UReturn = StoneBlueprint> (Class: TClass): UReturn | undefined

/**
 * Get the blueprint value from a class.
 *
 * @param Class - The class to get the blueprint from.
 * @param fallback - The default value to return if the blueprint key is not found.
 * @returns The blueprint value or the default value if the key does not exist.
 */
export function getBlueprint<TClass extends ClassType, UReturn = StoneBlueprint> (Class: TClass, fallback: UReturn): UReturn

/**
 * Get the blueprint value from a class.
 *
 * @param Class - The class to get the blueprint from.
 * @param fallback - The default value to return if the blueprint key is not found.
 * @returns The blueprint value or the default value if the key does not exist.
 */
export function getBlueprint<TClass extends ClassType, UReturn = StoneBlueprint> (Class: TClass, fallback?: UReturn): UReturn | undefined {
  const value = hasMetadataSymbol(Class) ? Class[MetadataSymbol]?.[BLUEPRINT_KEY] : undefined
  // Fall back whenever the blueprint key is absent — even if the class carries other metadata.
  return (value ?? fallback) as UReturn | undefined
}

/**
 * Wraps a class decorator to ensure compatibility with both legacy and 2023-11 proposal contexts.
 *
 * This wrapper enforces that the decorator is only applied in a valid 2023-11 proposal context
 * and throws appropriate errors for unsupported usage.
 *
 * @template T - The type of the class being decorated.
 * @param decorator - The class decorator function conforming to the 2023-11 proposal.
 * @returns A legacy-compatible `ClassDecorator` that works with TypeScript's expectations.
 *
 * @throws {SetupError} If the decorator is used outside the 2023-11 context or on invalid targets.
 */
export function classDecoratorLegacyWrapper<T extends ClassType = ClassType> (
  decorator: ProposalClassDecorator<T>
): ClassDecorator {
  return <TFunction extends Function>(target: TFunction, potentialContext?: ClassDecoratorContext<T>): TFunction | undefined => {
    if (potentialContext !== undefined) {
      if (potentialContext.kind === 'class') {
        return decorator(target as unknown as T, potentialContext) as (TFunction | undefined)
      } else {
        throw new SetupError('This decorator can only be applied to classes.')
      }
    } else {
      throw new SetupError('Class decorators must be used with the 2023-11 decorators proposal. This usage is not supported.')
    }
  }
}

/**
 * Wraps a method decorator to ensure compatibility with both legacy and 2023-11 proposal contexts.
 *
 * This wrapper enforces that the decorator is only applied in a valid 2023-11 proposal context
 * and throws appropriate errors for unsupported usage.
 *
 * @template T - The type of the method being decorated.
 * @param decorator - The method decorator function conforming to the 2023-11 proposal.
 * @returns A legacy-compatible `MethodDecorator` that works with TypeScript's expectations.
 *
 * @throws {SetupError} If the decorator is used outside the 2023-11 context or on invalid targets.
 */
export function methodDecoratorLegacyWrapper<T extends Function = Function> (
  decorator: ProposalMethodDecorator<T>
): MethodDecorator {
  return <TFunction>(
    target: Object | T,
    potentialContext: string | symbol | ClassMethodDecoratorContext,
    _descriptor?: TypedPropertyDescriptor<TFunction>
  ): TypedPropertyDescriptor<TFunction> | undefined => {
    if (potentialContext !== undefined) {
      if ((potentialContext as ClassMethodDecoratorContext).kind === 'method') {
        return decorator(target as T, potentialContext as ClassMethodDecoratorContext) as TypedPropertyDescriptor<TFunction>
      } else {
        throw new SetupError('This decorator can only be applied to class methods.')
      }
    } else {
      throw new SetupError('Class method decorators must be used with the 2023-11 decorators proposal. This usage is not supported.')
    }
  }
}

/**
 * Wraps a property decorator to ensure compatibility with both legacy and 2023-11 proposal contexts.
 *
 * This wrapper enforces that the decorator is only applied in a valid 2023-11 proposal context
 * and throws appropriate errors for unsupported usage.
 *
 * @param decorator - The property decorator function conforming to the 2023-11 proposal.
 * @returns A legacy-compatible `PropertyDecorator` that works with TypeScript's expectations.
 *
 * @throws {SetupError} If the decorator is used outside the 2023-11 context or on invalid targets.
 */
export function propertyDecoratorLegacyWrapper (
  decorator: ProposalPropertyDecorator
): PropertyDecorator {
  return (
    _target: Object,
    potentialContext: string | symbol | ClassFieldDecoratorContext
  ): (initialValue: unknown) => unknown => {
    if (potentialContext !== undefined) {
      if ((potentialContext as ClassFieldDecoratorContext).kind === 'field') {
        return decorator(undefined, potentialContext as ClassFieldDecoratorContext)
      } else {
        throw new SetupError('This decorator can only be applied to class fields.')
      }
    } else {
      throw new SetupError('Class field decorators must be used with the 2023-11 decorators proposal. This usage is not supported.')
    }
  }
}

/**
 * Type guard to check if a class has metadata.
 *
 * @param target - The target class to check.
 * @returns True if the target has metadata, false otherwise.
 */
function hasMetadataSymbol (target: ClassType): target is ClassType & MetadataHolder {
  return (isFunctionModule<MetadataHolder>(target) || isObjectLikeModule<MetadataHolder>(target)) && isNotEmpty(target[MetadataSymbol])
}
