import { isEmpty } from '../utils'
import { IAdapterEventBuilder } from '../declarations'
import { IntegrationError } from '../errors/IntegrationError'

/**
 * AdapterEventBuilderOptions.
 *
 * This interface defines the options used to create an AdapterEventBuilder instance.
 * It includes an optional initial options object of type `V` and a resolver function.
 *
 * @template V - The type of the options used to build the final object.
 * @template R - The type of the final object that will be built.
 */
export interface AdapterEventBuilderOptions<V, R> {
  /**
   * The initial options used for building the object. This is optional.
   */
  options?: V

  /**
   * The resolver function that takes the options and returns the final object of type `R`.
   */
  resolver: (options: V) => R
}

/**
 * Class representing a generic AdapterEventBuilder.
 *
 * This class provides a builder pattern to construct an object of type `R` based on options of type `V`.
 * It is intended to handle complex object creation by allowing flexible modification of options and resolving the final object.
 *
 * @template V - The type of the options used to build the final object. Must be an object.
 * @template R - The type of the final object that will be built.
 */
export class AdapterEventBuilder<V extends object, R> implements IAdapterEventBuilder<V, R> {
  /**
   * The options used for building the final object.
   */
  public readonly options: V

  /**
   * The resolver function that takes the options and returns the final object of type `R`.
   */
  private readonly resolver: (options: V) => R

  /**
   * Static method to create a new AdapterEventBuilder instance.
   *
   * @param options - The options for creating the AdapterEventBuilder instance, including the initial options and the resolver function.
   * @returns A new instance of AdapterEventBuilder.
   */
  static create<V extends object, R>(options: AdapterEventBuilderOptions<V, R>): AdapterEventBuilder<V, R> {
    return new this(options)
  }

  /**
   * Constructs an AdapterEventBuilder.
   *
   * @param options - The options for creating the AdapterEventBuilder instance, including the initial options and the resolver function.
   * @protected
   */
  protected constructor ({ options, resolver }: AdapterEventBuilderOptions<V, R>) {
    if (typeof resolver !== 'function') { throw new IntegrationError('Resolver is required to create an AdapterEventBuilder instance.') }
    this.resolver = resolver
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions */
    this.options = options ?? ({} as V)
  }

  /**
   * Adds or updates a key-value pair in the options.
   *
   * @param key - The key in the options to be updated.
   * @param value - The value to set for the given key.
   * @returns This instance of AdapterEventBuilder for method chaining.
   */
  add (key: keyof V, value: V[typeof key]): this {
    this.options[key] = value
    return this
  }

  /**
   * Adds a key-value pair in the options if the key does not already exist.
   *
   * @param key - The key in the options to be updated.
   * @param value - The value to set for the given key.
   * @returns This instance of AdapterEventBuilder for method chaining.
   */
  addIf (key: keyof V, value: V[typeof key]): this {
    if (isEmpty(this.options[key])) {
      this.add(key, value)
    }
    return this
  }

  /**
   * Builds the final object by using the resolver function with the current options.
   *
   * @returns The final object of type `R`.
   */
  build (): R {
    return this.resolver(this.options)
  }
}
