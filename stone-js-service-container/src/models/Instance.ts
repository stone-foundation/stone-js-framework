import { Binding } from './Binding'
import { BindingValue, IContainer } from '../declarations'

/**
 * Class representing an Instance.
 *
 * This class extends the Binding class and directly holds an instance value.
 * It provides a straightforward resolution mechanism that simply returns the stored value.
 *
 * @template V - The type of value that this binding holds.
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class Instance<V extends BindingValue> extends Binding<V> {
  /**
   * Resolve and return the value of the binding.
   *
   * @param _container - Container to resolve dependencies (not used in this implementation).
   * @returns The resolved value of the binding.
   */
  resolve (_container: IContainer): V | undefined {
    return this.value
  }
}
