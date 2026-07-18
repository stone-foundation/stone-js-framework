/**
 * A resolver function that takes a container and returns a value of type V.
 *
 * @template V - The type of value that the resolver returns.
 * @param container - The container used to resolve dependencies.
 * @returns The resolved value of type V.
 *
 * @example
 * ```typescript
 * const myResolver: Resolver<number> = (container: IContainer) => {
 *   // Use the container to resolve dependencies and return a number.
 *   return 42;
 * };
 * ```
 */
export type Resolver<V> = (container: IContainer) => V

/**
 * A union type representing the possible keys that can be used to bind values in the container.
 *
 * Binding keys can be of various types, such as numbers, booleans, strings, functions, objects, or symbols.
 * These types are used because they provide a broad range of ways to uniquely identify a binding.
 *
 * - `number`, `boolean`, `string`: These are basic types that are easy to use and uniquely identify a binding.
 * - `Function`: Useful for identifying bindings by constructor or other functions.
 * - `object`: Allows more complex key types, like instances of classes.
 * - `symbol`: Guarantees a unique identifier, which can prevent conflicts.
 *
 * @example
 * ```typescript
 * const key1: BindingKey = 42; // Using a number as a key
 * const key2: BindingKey = 'serviceName'; // Using a string as a key
 * const key3: BindingKey = Symbol('uniqueKey'); // Using a symbol for uniqueness
 * const key4: BindingKey = MyServiceClass; // Using a function (constructor) as a key
 * const key5: BindingKey = { custom: 'objectKey' }; // Using an object as a key
 * ```
 */
export type BindingKey = number | boolean | string | Function | object | symbol

/**
 * A union type representing the possible values that can be bound in the container.
 *
 * Binding values can be of various types, including numbers, booleans, strings, functions, objects, or symbols.
 * Unlike `BindingKey`, `BindingValue` represents the actual data or instance being bound, while `BindingKey` represents the identifier used to access that data.
 */
export type BindingValue = number | boolean | string | Function | object | symbol

/**
 * Interface representing a Binding.
 *
 * This interface defines the contract for all types of bindings in the service container.
 * Bindings are used to manage dependencies and control how objects are instantiated within the container.
 *
 * @template V - The type of value that this binding holds.
 * @author Mr. Stone <evensstone@gmail.com>
 */
export interface IBinding<V extends BindingValue> {
  /**
   * Resolve and return the value of the binding.
   *
   * @param container - The container to resolve dependencies from.
   * @returns The resolved value of the binding.
   */
  resolve: (container: IContainer) => V | undefined
}

/**
 * Interface representing a Container.
 *
 * This interface defines the public contract for dependency injection containers,
 * allowing for better testability and preventing circular dependencies.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export interface IContainer {
  /**
   * Retrieve the value of the bindings property.
   */
  getBindings: () => Map<BindingKey, IBinding<BindingValue>>

  /**
   * Retrieve the value of the aliases property.
   */
  getAliases: () => Map<string, BindingKey>

  /**
   * Set a binding as alias.
   */
  alias: (key: BindingKey, aliases: string | string[]) => this

  /**
   * Check if an alias exists in the container.
   */
  isAlias: (alias: BindingKey) => boolean

  /**
   * Get a binding key by its alias.
   */
  getAliasKey: (alias: BindingKey) => BindingKey | undefined

  /**
   * Bind a single instance or value into the container under the provided key.
   */
  instance: (key: BindingKey, value: BindingValue) => this

  /**
   * Bind a single instance or value into the container under the provided key if not already bound.
   */
  instanceIf: (key: BindingKey, value: BindingValue) => this

  /**
   * Bind a resolver function into the container under the provided key as a singleton.
   */
  singleton: <V extends BindingValue>(key: BindingKey, resolver: Resolver<V>) => this

  /**
   * Bind a resolver function into the container under the provided key as a singleton if not already bound.
   */
  singletonIf: <V extends BindingValue>(key: BindingKey, resolver: Resolver<V>) => this

  /**
   * Bind a resolver function into the container under the provided key, returning a new instance each time.
   */
  binding: <V extends BindingValue>(key: BindingKey, resolver: Resolver<V>) => this

  /**
   * Bind a resolver function into the container under the provided key, returning a new instance each time if not already bound.
   */
  bindingIf: <V extends BindingValue>(key: BindingKey, resolver: Resolver<V>) => this

  /**
   * Resolve a registered value from the container by its key.
   */
  make: <V extends BindingValue>(key: BindingKey) => V

  /**
   * Resolve a value from the container by its key, binding it if necessary.
   */
  resolve: <V extends BindingValue>(key: BindingKey, singleton?: boolean) => V

  /**
   * Resolve a value from the container by its key and return it in a factory function.
   */
  factory: <V extends BindingValue>(key: BindingKey) => () => V

  /**
   * Check if a value is already bound in the container by its key.
   */
  bound: (key: BindingKey) => boolean

  /**
   * Check if a value is already bound in the container by its key.
   */
  has: (key: BindingKey) => boolean

  /**
   * Reset the container so that all bindings are removed.
   */
  clear: () => this

  /**
   * AutoBind value to the service container.
   */
  autoBinding: <V extends BindingValue>(name: BindingKey, item?: V, singleton?: boolean, alias?: string | string[]) => this
}
