import { Proxiable } from './Proxiable'
import { Binding } from './models/Binding'
import { Factory } from './models/Factory'
import { Instance } from './models/Instance'
import { Singleton } from './models/Singleton'
import { ContainerError } from './errors/ContainerError'
import { BindingKey, BindingValue, Resolver, IContainer } from './declarations'

/**
 * Class representing a Container.
 *
 * The Container class acts as a dependency injection container, managing bindings and resolving instances.
 * It supports different types of bindings, such as singletons, factories, and instances, and allows the use of aliases for bindings.
 * This makes it easier to manage and resolve complex dependency trees in an application.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class Container extends Proxiable implements IContainer {
  private readonly aliases: Map<string, BindingKey>
  private readonly resolvingKeys: Set<BindingKey> = new Set()
  private readonly bindings: Map<BindingKey, Binding<BindingValue>>

  /**
   * Create a Container.
   *
   * @returns A new Container instance.
   */
  static create (): Container {
    return new this()
  }

  /**
   * Create a ProxyHandler for the container.
   *
   * @returns A new ProxyHandler instance.
   */
  /**
   * Well-known property names that must never trigger service resolution. Accessing them
   * (via `await container`, `JSON.stringify`, `console.log`, React element checks, spread,
   * etc.) returns `undefined` so the container is safe to inspect and pass around, while
   * genuine unknown-service access still fails fast through `make()`.
   */
  private static readonly SYSTEM_PROPS = new Set<PropertyKey>([
    'then', 'catch', 'finally',
    'toJSON', 'toString', 'valueOf', 'inspect',
    'constructor', 'prototype', '$$typeof', 'nodeType'
  ])

  private static Proxyhandler (): ProxyHandler<Container> {
    return {
      get: (target: Container, prop: PropertyKey, receiver: unknown) => {
        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop, receiver)
        }
        // Symbols (Symbol.toPrimitive, Symbol.iterator, inspect.custom…) and well-known
        // system props are inspection/coercion hooks, never services: return undefined.
        if (typeof prop === 'symbol' || Container.SYSTEM_PROPS.has(prop)) {
          return undefined
        }
        // Otherwise resolve as a bound service (make throws ContainerError if unbound).
        return target.make(prop)
      }
    }
  }

  /**
   * Create a container.
   *
   * Initializes the container with empty alias and binding maps.
   */
  protected constructor () {
    super(Container.Proxyhandler())
    this.aliases = new Map()
    this.bindings = new Map()
  }

  /**
   * Retrieve the value of the bindings property.
   *
   * @returns A map of all bindings registered in the container.
   */
  getBindings (): Map<BindingKey, Binding<BindingValue>> {
    return this.bindings
  }

  /**
   * Retrieve the value of the aliases property.
   *
   * @returns A map of all aliases registered in the container.
   */
  getAliases (): Map<string, BindingKey> {
    return this.aliases
  }

  /**
   * Set a binding as alias.
   *
   * Adds one or more aliases for a given binding key.
   *
   * @param key - The binding value.
   * @param aliases - One or more strings representing the aliases.
   * @returns The container instance.
   */
  alias (key: BindingKey, aliases: string | string[]): this {
    ([] as string[]).concat(aliases).forEach((alias) => {
      if (key === alias) {
        throw new ContainerError(ContainerError.ALIAS_TYPE, key)
      } else if (!this.has(key)) {
        throw new ContainerError(ContainerError.ALIAS_UNBOUND_TYPE, key)
      }
      this.aliases.set(alias, key)
    })
    return this
  }

  /**
   * Check if an alias exists in the container.
   *
   * @param alias - The alias to check.
   * @returns True if the alias exists, false otherwise.
   */
  isAlias (alias: BindingKey): boolean {
    return this.aliases.has(alias as string)
  }

  /**
   * Get a binding key by its alias.
   *
   * @param alias - The alias name.
   * @returns The binding key associated with the alias, or undefined if not found.
   */
  getAliasKey (alias: BindingKey): BindingKey | undefined {
    return this.aliases.get(alias as string)
  }

  /**
   * Bind a single instance or value into the container under the provided key.
   *
   * @param key - The key to associate with the value.
   * @param value - The value to be bound.
   * @returns The container instance.
   */
  instance (key: BindingKey, value: BindingValue): this {
    this.bindings.set(key, new Instance(value))
    return this
  }

  /**
   * Bind a single instance or value into the container under the provided key if not already bound.
   *
   * @param key - The key to associate with the value.
   * @param value - The value to be bound.
   * @returns The container instance.
   */
  instanceIf (key: BindingKey, value: BindingValue): this {
    if (!this.bound(key)) {
      this.instance(key, value)
    }
    return this
  }

  /**
   * Bind a resolver function into the container under the provided key as a singleton.
   *
   * The resolver function will be called once, and the resulting value will be cached for future use.
   *
   * @param key - The key to associate with the singleton value.
   * @param resolver - The resolver function to provide the value.
   * @returns The container instance.
   */
  singleton<V extends BindingValue>(key: BindingKey, resolver: Resolver<V>): this {
    this.bindings.set(key, new Singleton(resolver))
    return this
  }

  /**
   * Bind a resolver function into the container under the provided key as a singleton if not already bound.
   *
   * @param key - The key to associate with the singleton value.
   * @param resolver - The resolver function to provide the value.
   * @returns The container instance.
   */
  singletonIf<V extends BindingValue>(key: BindingKey, resolver: Resolver<V>): this {
    if (!this.bound(key)) {
      this.singleton(key, resolver)
    }
    return this
  }

  /**
   * Bind a resolver function into the container under the provided key, returning a new instance each time.
   *
   * @param key - The key to associate with the value.
   * @param resolver - The resolver function to provide the value.
   * @returns The container instance.
   */
  binding<V extends BindingValue>(key: BindingKey, resolver: Resolver<V>): this {
    this.bindings.set(key, new Factory(resolver))
    return this
  }

  /**
   * Bind a resolver function into the container under the provided key, returning a new instance each time if not already bound.
   *
   * @param key - The key to associate with the value.
   * @param resolver - The resolver function to provide the value.
   * @returns The container instance.
   */
  bindingIf<V extends BindingValue>(key: BindingKey, resolver: Resolver<V>): this {
    if (!this.bound(key)) {
      this.binding(key, resolver)
    }
    return this
  }

  /**
   * Resolve a registered value from the container by its key.
   *
   * @param key - The key to resolve.
   * @returns The resolved value.
   * @throws ContainerError if the key cannot be resolved.
   */
  make<V extends BindingValue>(key: BindingKey): V {
    key = this.getAliasKey(key) ?? key

    if (this.resolvingKeys.has(key)) {
      // Surface the full resolution chain (A → B → C → A) so the cycle is diagnosable
      // at a glance, not just the offending key.
      const chain = [...this.resolvingKeys, key].map(containerKeyName).join(' → ')
      throw new ContainerError(ContainerError.CIRCULAR_DEPENDENCY_TYPE, chain)
    }

    this.resolvingKeys.add(key)

    try {
      const binding = this.bindings.get(key)
      if (binding !== undefined) {
        return binding.resolve(new Proxy(this, Container.Proxyhandler())) as V
      }
    } finally {
      this.resolvingKeys.delete(key)
    }

    throw new ContainerError(ContainerError.RESOLUTION_TYPE, key)
  }

  /**
   * Resolve a value from the container by its key, binding it if necessary.
   *
   * @param key - The key to resolve.
   * @param singleton - Whether to bind as a singleton if not already bound.
   * @returns The resolved value.
   */
  resolve<V extends BindingValue>(key: BindingKey, singleton: boolean = false): V {
    if (this.has(key)) {
      return this.make(key)
    } else {
      return this.autoBinding(key, key, singleton).make(key)
    }
  }

  /**
   * Resolve a value from the container by its key and return it in a factory function.
   *
   * @param key - The key to resolve.
   * @returns A factory function that returns the resolved value.
   */
  factory<V extends BindingValue>(key: BindingKey): () => V {
    return () => this.make(key)
  }

  /**
   * Check if a value is already bound in the container by its key.
   *
   * @param key - The key to check.
   * @returns True if the key is bound, false otherwise.
   */
  bound (key: BindingKey): boolean {
    return this.bindings.has(this.getAliasKey(key) ?? key)
  }

  /**
   * Check if a value is already bound in the container by its key.
   *
   * @param key - The key to check.
   * @returns True if the key is bound, false otherwise.
   */
  has (key: BindingKey): boolean {
    return this.bound(key)
  }

  /**
   * Reset the container so that all bindings are removed.
   *
   * @returns The container instance.
   */
  clear (): this {
    this.aliases.clear()
    this.bindings.clear()
    return this
  }

  /**
   * AutoBind value to the service container.
   *
   * @param name - A key to make the binding. Can be anything.
   * @param item - The item to bind.
   * @param singleton - Bind as singleton when true.
   * @param alias - Key binding aliases.
   * @returns The container instance.
   */
  autoBinding<V extends BindingValue>(name: BindingKey, item?: V, singleton: boolean = true, alias: string | string[] = []): this {
    const key = name
    const value = item ?? name

    if (!this.bound(key)) {
      if (typeof value === 'function') {
        const callable = value
        // Only real ES classes are instantiated with `new`; ordinary/arrow factory
        // functions are called. `hasOwnProperty('prototype')` was too loose (every
        // non-arrow function has a prototype), breaking `function` factories.
        const resolver: (container: IContainer) => V = isClassConstructor(callable)
          ? (container: IContainer) => new (callable as new (c: IContainer) => V)(container)
          : (container: IContainer) => (callable as (c: IContainer) => V)(container)
        singleton ? this.singleton(key, resolver) : this.binding(key, resolver)
      } else {
        this.instance(key, value)
      }
    }
    // Apply aliases even when the key is already bound (aliasing was previously dropped).
    this.alias(key, alias)
    return this
  }
}

/**
 * Detect a class constructor (as opposed to an ordinary or factory function).
 *
 * Uses two complementary signals so it survives down-level (ES5) bundling:
 * 1. Native/modern classes stringify with the `class` keyword.
 * 2. Transpiled classes lose the keyword but keep their methods on the prototype, whereas a
 *    plain/factory function's prototype has only `constructor`.
 *
 * For ambiguous cases, callers should pass an explicit `isClass`/`isFactory` flag.
 *
 * @param value - The value to test.
 * @returns True if the value is (very likely) a class constructor.
 */
function isClassConstructor (value: Function): boolean {
  // Callers already narrow to `typeof value === 'function'`, so no redundant guard here.
  // A function's source starts with `class` only for real ES classes.
  if (Function.prototype.toString.call(value).startsWith('class')) { return true }
  // Otherwise fall back to the ES5-safe heuristic: a transpiled class carries own methods on
  // its prototype (a bare/arrow factory does not).
  const proto = (value as { prototype?: object }).prototype
  if (proto === undefined || proto === null) { return false }
  return Object.getOwnPropertyNames(proto).length > 1
}

/**
 * Produce a readable name for a binding key (used in circular-dependency chains).
 *
 * @param key - The binding key.
 * @returns A human-readable label.
 */
function containerKeyName (key: unknown): string {
  if (typeof key === 'function') { return key.name.length > 0 ? key.name : 'anonymous' }
  if (typeof key === 'symbol') { return key.toString() }
  if (typeof key === 'object' && key !== null) { return key.constructor?.name ?? 'Object' }
  return String(key)
}
