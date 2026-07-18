import { ResolverBinding } from './ResolverBinding'
import { ContainerError } from '../errors/ContainerError'
import { BindingValue, IContainer } from '../declarations'

/**
 * Class representing a Factory.
 *
 * The Factory class extends the ResolverBinding class, providing a mechanism to resolve a new instance each time the binding is resolved.
 * This ensures that a fresh instance is created with each call to the `resolve` method.
 *
 * @template V - The type of value that this binding holds.
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class Factory<V extends BindingValue> extends ResolverBinding<V> {
  /**
   * Resolve and return the value of the binding.
   *
   * Each time this method is called, a new value is resolved using the resolver function.
   * This is intended for cases where a fresh instance is required for each resolution, such as factories or transient dependencies.
   *
   * @param container - The container to resolve dependencies from.
   * @returns The resolved value of the binding.
   * @throws ContainerError if the value cannot be resolved.
   */
  resolve (container: IContainer): V {
    try {
      return this.resolver(container)
    } catch (error: any) {
      throw new ContainerError(ContainerError.CANNOT_RESOLVE_TYPE, error.message)
    }
  }
}
