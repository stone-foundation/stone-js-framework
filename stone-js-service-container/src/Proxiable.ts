/**
 * Class representing a Proxiable.
 *
 * This class allows instances to be wrapped in a Proxy, enabling custom behaviors for property access, assignment, etc.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
/* eslint-disable-next-line @typescript-eslint/no-extraneous-class */
export abstract class Proxiable {
  /**
   * Creates a Proxiable instance wrapped in a Proxy.
   *
   * @param handler - A trap object for the proxy, which defines custom behavior for fundamental operations (e.g., property lookup, assignment, etc.).
   * @returns A new proxy object for this instance.
   */
  constructor (handler: ProxyHandler<Proxiable>) {
    return new Proxy(this, handler)
  }
}
