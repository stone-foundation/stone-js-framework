/**
 * Overload signatures for the `@decorator` syntax.
 */
declare global {
  interface SymbolConstructor {
    /**
     * A unique symbol used for storing metadata in the new decorators proposal.
     */
    readonly metadata: unique symbol
  }

  /**
   * Extend the `Function` interface to include the metadata symbol.
   */
  interface Function {
    [Symbol.metadata]?: Record<PropertyKey, unknown> & object
  }
}

export {};
