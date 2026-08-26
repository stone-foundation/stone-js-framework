import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * The JSON-RPC error codes this server answers with.
 *
 * The four standard ones. MCP adds no codes of its own for what happens here: a tool that fails is
 * **not** a protocol error, it is a successful call whose result says `isError`, which is what lets
 * an agent read the failure and try something else instead of losing the conversation.
 */
export const JSONRPC_ERROR_CODES: Record<string, number> = {
  parseError: -32700,
  invalidRequest: -32600,
  methodNotFound: -32601,
  invalidParams: -32602,
  internalError: -32603
}

/** What an MCP protocol error carries. */
export interface McpErrorOptions extends ErrorOptions {
  /** The JSON-RPC code. */
  jsonRpcCode: number
}

/**
 * Raised when a message cannot be answered at the protocol level.
 *
 * Deliberately rare. A malformed envelope, an unknown method, arguments that are not an object: the
 * cases where there is no result to speak of. Everything a tool itself does wrong travels back as a
 * result, not as one of these.
 */
export class McpError extends IntegrationError {
  readonly jsonRpcCode: number

  constructor (message: string, options: McpErrorOptions) {
    super(message, { code: 'MCP_PROTOCOL_ERROR', ...options })
    this.name = 'McpError'
    this.jsonRpcCode = options.jsonRpcCode
  }
}

/**
 * Raised for a setup mistake, so a misconfigured server never looks like a failing tool.
 *
 * The distinction matters here more than usual: an agent retries what looks retryable, and a server
 * that answered "tool failed" to "there is no router" would be retried forever.
 */
export class McpConfigurationError extends IntegrationError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, { code: 'MCP_CONFIGURATION_ERROR', ...options })
    this.name = 'McpConfigurationError'
  }
}
