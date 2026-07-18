import { BindingKey } from '../declarations'

/**
 * Class representing a ContainerError.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class ContainerError extends Error {
  /**
   * Error type indicating an alias conflict.
   */
  static readonly ALIAS_TYPE = 'alias'

  /**
   * Error type indicating that the resolver is not a function.
   */
  static readonly RESOLVER_TYPE = 'resolver'

  /**
   * Error type indicating a resolution failure.
   */
  static readonly RESOLUTION_TYPE = 'resolution'

  /**
   * Error type indicating an attempt to alias an unbound value.
   */
  static readonly ALIAS_UNBOUND_TYPE = 'alias_unbound'

  /**
   * Error type indicating that a value is not a service.
   */
  static readonly NOT_A_SERVICE_TYPE = 'not_a_service'

  /**
   * Error type indicating an error thrown by the resolver function.
   */
  static readonly CANNOT_RESOLVE_TYPE = 'cannot_resolve'

  /**
   * Error type indicating a circular dependency.
   */
  static readonly CIRCULAR_DEPENDENCY_TYPE = 'circular_dependency'

  /**
   * The type of the error.
   */
  private readonly type: string

  /**
   * Create a ContainerError.
   *
   * @param type - The type of the error.
   * @param message - The error message or key related to the error.
   */
  constructor (type: string, message: BindingKey) {
    super()
    this.type = type
    this.name = 'ContainerError'
    this.message = this.getMessage(type, message)
  }

  /**
   * Retrieve the error message based on the type and provided message.
   *
   * @param type - The type of the error.
   * @param message - The error message or key related to the error.
   * @returns The formatted error message.
   */
  private getMessage (type: string, message: BindingKey): string {
    const messages: Record<string, string> = {
      [ContainerError.RESOLUTION_TYPE]: this.getResolutionMessage(message),
      [ContainerError.ALIAS_TYPE]: `${String(message)} is aliased to itself`,
      [ContainerError.CANNOT_RESOLVE_TYPE]: `Failed to resolve binding: ${String(message)}`,
      [ContainerError.ALIAS_UNBOUND_TYPE]: `Cannot alias an unbound value : ${String(message)}`,
      [ContainerError.CIRCULAR_DEPENDENCY_TYPE]: `Circular dependency detected: ${String(message)}`,
      [ContainerError.RESOLVER_TYPE]: `Invalid resolver: Expected a function but received ${typeof message}`,
      [ContainerError.NOT_A_SERVICE_TYPE]: `This (${String(message)}) is not a service. Must contain $$metadata$$ static property or must use @Service decorator.`
    }
    return messages[type] ?? 'An error has occurred.'
  }

  /**
   * Retrieve the resolution message based on the key.
   *
   * @param key - The key for which the resolution failed.
   * @returns The formatted resolution error message.
   */
  private getResolutionMessage (key: BindingKey): string {
    let value = ''

    if (key === undefined) {
      value = 'undefined'
    } else if (key === null) {
      value = 'null'
    } else if (typeof key === 'function') {
      const funcName = key.name !== '' ? `: ${key.name}` : ''
      value = `[Function${funcName}]`
    } else if (typeof key === 'object') {
      value = `[Object: ${key.constructor.name}]`
    } else if (typeof key === 'string') {
      value = `type ${typeof key} with a value of '${key}'`
    } else if (typeof key === 'symbol') {
      value = key.toString()
    } else {
      value = `type ${typeof key} with a value of ${String(key)}`
    }

    return `Failed to resolve a binding with a key of ${value} from the service container.`
  }
}
