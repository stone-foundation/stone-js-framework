/**
 * Where a handler's `@Tool` declaration is recorded.
 *
 * A string rather than a symbol, by the same convention every first-party module follows: another
 * package can read it without importing this one, which is what lets a contract, a documentation
 * generator or a linter see the declaration.
 */
export const TOOL_KEY: string = '@stone-js/mcp/tool'
