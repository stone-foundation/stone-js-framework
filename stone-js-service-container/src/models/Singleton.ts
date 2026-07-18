import { ResolverBinding } from './ResolverBinding'
import { ContainerError } from '../errors/ContainerError'
import { BindingValue, IContainer } from '../declarations'

/**
 * Class representing a Singleton.
 *
 * The Singleton class extends the ResolverBinding class, ensuring that the value is only resolved once.
 * Subsequent calls to the `resolve` method will return the previously resolved value, making it behave as a singleton.
 *
 * @template V - The type of value that this binding holds.
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class Singleton<V extends BindingValue> extends ResolverBinding<V> {
  /**
   * Resolve and return the value of the binding.
   *
   * If the value has already been resolved, return the cached value. Otherwise, use the resolver function
   * to resolve the value, store it, and return it.
   *
   * @param container - The container to resolve dependencies from.
   * @returns The resolved value of the binding.
   * @throws ContainerError if the value cannot be resolved.
   */
  resolve (container: IContainer): V | undefined {
    if (!this.isResolved()) {
      try {
        this.value = this.resolver(container)
        this.resolved = true
      } catch (error: any) {
        throw new ContainerError(ContainerError.CANNOT_RESOLVE_TYPE, error.message)
      }
    }
    return this.value
  }
}
