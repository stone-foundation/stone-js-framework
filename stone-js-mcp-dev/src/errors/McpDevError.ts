import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * Custom error for the MCP dev module.
 */
export class McpDevError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'McpDevError'
  }
}
