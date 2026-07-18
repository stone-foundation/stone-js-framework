import { Binding } from './Binding'
import { BindingValue, Resolver } from '../declarations'
import { ContainerError } from '../errors/ContainerError'

/**
 * Class representing a ResolverBinding.
 *
 * This class extends the Binding class, using a resolver function to lazily resolve the value when needed.
 *
 * @template V - The type of value that this binding holds.
 * @author Mr. Stone <evensstone@gmail.com>
 */
export abstract class ResolverBinding<V extends BindingValue> extends Binding<V> {
  /**
   * The resolver function used to provide the binding value.
   *
   * This function will be called when the value is needed, allowing for lazy instantiation
   * and dependency resolution. It should return an instance of type `V`.
   */
  protected readonly resolver: Resolver<V>

  /**
   * Create a new instance of ResolverBinding.
   *
   * @param resolver - The resolver function to provide the binding value.
   * @throws ContainerError if the resolver is not a function.
   */
  constructor (resolver: Resolver<V>) {
    super()
    if (typeof resolver !== 'function') {
      throw new ContainerError(ContainerError.RESOLVER_TYPE, resolver)
    }
    this.resolver = resolver
  }
}
