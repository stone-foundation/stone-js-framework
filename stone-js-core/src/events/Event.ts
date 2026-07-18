import { getPath, setPath, isPlainObject, cloneValue } from '@stone-js/config'

/**
 * EventOptions.
 */
export interface EventOptions extends Record<string, unknown> {
  type?: string
  source?: object
  timeStamp?: number
  metadata?: Record<string, unknown>
}

/**
 * Class representing an Event.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export abstract class Event {
  /**
   * The type of the event.
   */
  public readonly type: string

  /**
   * The metadata associated with the event.
   */
  public readonly metadata: Record<string, unknown>

  /**
   * The source of the event.
   */
  public readonly source?: object

  /**
   * The timestamp of the event creation.
   */
  public readonly timeStamp: number

  /**
   * Create an Event.
   *
   * @param options - The options to create an Event.
   */
  protected constructor ({ type = '', metadata = {}, source, timeStamp = Date.now() }: EventOptions) {
    this.type = type
    this.source = source
    this.timeStamp = timeStamp
    this.metadata = isPlainObject(metadata) ? metadata : {}
  }

  /**
   * Get data from metadata.
   *
   * @param key - The key to retrieve from metadata.
   * @returns The value associated with the key or the fallback.
   */
  get<TReturn = unknown>(key: string): TReturn | undefined

  /**
   * Get data from metadata.
   *
   * @param key - The key to retrieve from metadata.
   * @param fallback - The fallback value if the key is not found.
   * @returns The value associated with the key or the fallback.
   */
  get<TReturn = unknown>(key: string, fallback: TReturn): TReturn

  /**
   * Get data from metadata.
   *
   * @param key - The key to retrieve from metadata.
   * @param fallback - The fallback value if the key is not found.
   * @returns The value associated with the key or the fallback.
   */
  get<TReturn = unknown>(key: string, fallback?: TReturn): TReturn | undefined {
    return this.getMetadataValue(key, fallback)
  }

  /**
   * Check if the given value is equal to the specified value.
   *
   * @param key - The key to check.
   * @param value - The value to compare against.
   * @returns True if the key's value is equal to the specified value, false otherwise.
   */
  is (key: string, value: unknown): boolean {
    return this.get(key) === value
  }

  /**
   * Get data from metadata.
   *
   * @param key - The key to retrieve from metadata.
   * @returns The value associated with the key or the fallback.
   */
  getMetadataValue<TReturn = unknown>(key: string): TReturn | undefined

  /**
   * Get data from metadata.
   *
   * @param key - The key to retrieve from metadata.
   * @param fallback - The fallback value if the key is not found.
   * @returns The value associated with the key or the fallback.
   */
  getMetadataValue<TReturn = unknown>(key: string, fallback: TReturn): TReturn

  /**
   * Get data from metadata.
   *
   * @param key - The key to retrieve from metadata.
   * @param fallback - The fallback value if the key is not found.
   * @returns The value associated with the key or the fallback.
   */
  getMetadataValue<TReturn = unknown>(key: string, fallback?: TReturn): TReturn | undefined {
    return getPath<TReturn>(this.metadata, key, fallback)
  }

  /**
   * Add data to metadata.
   *
   * @param key - The key or object to add to metadata.
   * @param value - The value to associate with the key.
   * @returns This Event instance.
   */
  setMetadataValue (key: string | Record<string, unknown>, value?: unknown): this {
    Object.entries(isPlainObject(key) ? key : { [key as string]: value }).forEach(([name, val]) => setPath(this.metadata, name, val))
    return this
  }

  /**
   * Return a cloned instance.
   *
   * The `metadata` container is deep-copied (plain objects and arrays are recreated,
   * special values kept by reference) so that mutating the clone's metadata — e.g. via
   * middleware — never leaks back into the original event. This is what makes the
   * Kernel's `originalEvent` snapshot a faithful pre-middleware copy.
   *
   * @returns A cloned instance of the current class.
   */
  clone (): this {
    const cloned = Object.assign(Object.create(Object.getPrototypeOf(this)), this) as this
    // Reuse the shared, framework-wide deep clone (plain objects/arrays recreated, special
    // values kept by reference) so clone mutations never leak into the original event.
    Object.defineProperty(cloned, 'metadata', {
      value: cloneValue(this.metadata),
      writable: false,
      enumerable: true,
      configurable: true
    })
    return cloned
  }
}
