import { Proxiable } from './Proxiable'
import { getPath, setPath, hasPath, deepMerge, cloneValue, isObjectLike } from './utils'

/**
 * Class representing a Config.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @template TObject
 */
export class Config<TObject extends object = Record<PropertyKey, unknown>> extends Proxiable {
  private items: TObject

  /**
   * Create a Config.
   *
   * @param items - Initial configuration items.
   * @returns A new Config instance.
   */
  static create<TObject extends object = Record<PropertyKey, unknown>>(items?: TObject): Config<TObject> {
    return new this(items)
  }

  /**
   * Create a Config from a JSON string.
   *
   * @param items - The JSON string to create the Config from.
   * @returns A new Config instance.
   */
  static fromJson<TObject extends object = Record<PropertyKey, unknown>>(items: string): Config<TObject> {
    return new this(JSON.parse(items))
  }

  /**
   * Create a Config.
   *
   * @param items - Initial configuration items.
   */
  protected constructor (items?: any) {
    super({
      get: (target: Config<TObject>, prop: PropertyKey, receiver: unknown): unknown => {
        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop, receiver)
        } else {
          return target.get(prop)
        }
      }
    })

    this.items = { ...items }
  }

  /**
   * Get the specified configuration value.
   *
   * @param key - The key or keys to retrieve from the configuration.
   * @returns The configuration value.
   */
  public get<TReturn = unknown>(key: PropertyKey): TReturn | undefined

  /**
   * Get the specified configuration value.
   *
   * @param key - The key or keys to retrieve from the configuration.
   * @param fallback - The fallback value if the key does not exist.
   * @returns The configuration value.
   */
  public get<TReturn = unknown>(key: PropertyKey, fallback: TReturn): TReturn

  /**
   * Get the specified configuration value.
   *
   * @param key - The key or keys to retrieve from the configuration.
   * @param fallback - The fallback value if the key does not exist.
   * @returns The configuration value.
   */
  public get<TReturn = unknown>(key: PropertyKey, fallback?: TReturn): TReturn | undefined {
    return getPath<TReturn>(this.items, key, fallback)
  }

  /**
   * Get the first match configuration value.
   *
   * @param keys - An array of keys to check.
   * @returns The first matching configuration value.
   */
  public firstMatch<TReturn = unknown>(keys: PropertyKey[]): TReturn | undefined

  /**
   * Get the first match configuration value.
   *
   * @param keys - An array of keys to check.
   * @param fallback - The fallback value if no key matches.
   * @returns The first matching configuration value.
   */
  public firstMatch<TReturn = unknown>(keys: PropertyKey[], fallback: TReturn): TReturn

  /**
   * Get the first match configuration value.
   *
   * @param keys - An array of keys to check.
   * @param fallback - The fallback value if no key matches.
   * @returns The first matching configuration value.
   */
  public firstMatch<TReturn = unknown>(keys: PropertyKey[], fallback?: TReturn): TReturn | undefined {
    const firstKey = keys.find((v) => this.has(v))
    return firstKey === undefined ? fallback : getPath<TReturn>(this.items, firstKey, fallback)
  }

  /**
   * Get many configuration values.
   *
   * @param keys - The keys to retrieve from the configuration.
   * @returns An object containing the requested configuration values.
   */
  public getMany<TReturn = Record<PropertyKey, unknown>>(keys: PropertyKey[] | Record<PropertyKey, unknown>): TReturn {
    const defaults: any = {}
    const entries: Array<[PropertyKey, unknown]> = Array.isArray(keys) ? keys.map((v) => [v, undefined]) : Object.entries(keys)
    return entries.reduce((results: TReturn, [key, fallback]) => ({ ...results, [key]: getPath(this.items, key, fallback) }), defaults)
  }

  /**
   * Determine if the given configuration value exists.
   *
   * @param key - The key or keys to check.
   * @returns True if the key exists, false otherwise.
   */
  public has (key: PropertyKey | PropertyKey[]): boolean {
    return hasPath(this.items, key)
  }

  /**
   * Determine if the given configuration value does not exist.
   *
   * @param key - The key or keys to check.
   * @returns True if the key does not exist, false otherwise.
   */
  public hasNot (key: PropertyKey | PropertyKey[]): boolean {
    return !this.has(key)
  }

  /**
   * Check if the given configuration value is equal to the specified value.
   *
   * @param key - The key to check.
   * @param value - The value to compare against.
   * @returns True if the key's value is equal to the specified value, false otherwise.
   */
  public is (key: PropertyKey, value: unknown): boolean {
    return this.get(key) === value
  }

  /**
   * Check if the given configuration value is not equal to the specified value.
   *
   * @param key - The key to check.
   * @param value - The value to compare against.
   * @returns True if the key's value is not equal to the specified value, false otherwise.
   */
  public isNot (key: PropertyKey, value: unknown): boolean {
    return !this.is(key, value)
  }

  /**
   * Set a given configuration value.
   *
   * @param key - The key or keys to set in the configuration.
   * @param value - The value to set.
   * @returns The current Config instance.
   */
  public set<TValue>(key: PropertyKey | PropertyKey[] | Record<string, TValue> | Record<PropertyKey, TValue>, value?: TValue): this {
    if (!Array.isArray(key) && typeof key === 'object') {
      Object.entries(key).forEach(([name, val]) => {
        const items = this.get(name)
        if (isObjectLike(items) && isObjectLike(val)) {
          setPath(this.items, name, deepMerge(items, val))
        } else {
          setPath(this.items, name, val)
        }
      })
    } else {
      setPath(this.items, key, value)
    }

    return this
  }

  /**
   * Set a given configuration value if it does not exist.
   *
   * @param key - The key or keys to set in the configuration.
   * @param value - The value to set.
   * @returns The current Config instance.
   */
  public setIf<TValue>(key: PropertyKey | PropertyKey[], value?: TValue): this {
    return this.has(key) ? this : this.set(key, value)
  }

  /**
   * Add a value to an existing configuration key.
   *
   * @param key - The key or keys to set as defaults.
   * @param value - The value to set as default.
   * @returns The current Config instance.
   */
  public add<TValue>(key: PropertyKey, value: TValue): this {
    const items = this.get(key)

    if (Array.isArray(items)) {
      return this.set(key, items.concat(value))
    } else if (isObjectLike(items) && isObjectLike(value)) {
      return this.set(key, deepMerge(items, value))
    }

    return this.set(key, value)
  }

  /**
   * Set all of the configuration items.
   *
   * @param items - The configuration items.
   * @returns The current Config instance.
   */
  public setItems (items: TObject): this {
    this.items = { ...items }
    return this
  }

  /**
   * Get all of the configuration items as a literal object.
   *
   * @returns All configuration items.
   */
  public all (): TObject {
    // Return a defensive deep clone (special objects kept by reference) so callers cannot
    // mutate the internal store directly — the config stays the single source of truth.
    return cloneValue(this.items)
  }

  /**
   * Get all of the configuration items as a JSON string.
   *
   * @returns All configuration items as a JSON string.
   */
  public toJson (): string {
    return JSON.stringify(this.items)
  }

  /**
   * Clear all of the configuration items.
   *
   * @returns The current Config instance.
   */
  public clear (): this {
    const empty: any = {}
    this.items = empty
    return this
  }
}
