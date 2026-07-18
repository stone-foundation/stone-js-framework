import { BindingValue, IContainer, IBinding } from '../declarations'

/**
 * Abstract class representing a Binding.
 *
 * This abstract class serves as the base class for all types of bindings in the service container. It holds a value and provides an abstract method
 * to resolve and return that value, allowing different subclasses to implement their own resolution logic. Bindings are used to manage dependencies
 * and control how objects are instantiated within the container.
 *
 * @template V - The type of value that this binding holds.
 * @author Mr. Stone <evensstone@gmail.com>
 */
export abstract class Binding<V extends BindingValue> implements IBinding<V> {
  /**
   * The value held by the binding.
   *
   * This value is resolved at runtime, either directly or through a resolver function.
   */
  protected value?: V

  /**
   * Whether the value has been resolved at least once.
   *
   * Tracked explicitly (not inferred from `value !== undefined`) so a binding whose resolved
   * value is legitimately `undefined` is still considered resolved — preserving the singleton
   * guarantee and avoiding repeated resolver side effects.
   */
  protected resolved: boolean

  /**
   * Create a new instance of Binding.
   *
   * @param value - The value to be held by the binding.
   */
  constructor (value?: V) {
    this.value = value
    this.resolved = value !== undefined
  }

  /**
   * Check if the value has been resolved.
   *
   * @returns A boolean indicating whether the value has been resolved.
   */
  protected isResolved (): boolean {
    return this.resolved
  }

  /**
   * Resolve and return the value of the binding.
   *
   * This abstract method must be implemented by subclasses to provide specific resolution logic.
   *
   * @param container - The container to resolve dependencies from.
   * @returns The resolved value of the binding.
   */
  abstract resolve (container: IContainer): V | undefined
}
