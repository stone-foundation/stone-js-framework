import { OutgoingResponse } from '@stone-js/core'

/** A minimal MCP `CallToolResult`. */
export interface CallToolResult {
  content: Array<{ type: 'text', text: string }>
  isError?: boolean
}

/**
 * Serialises an `OutgoingResponse` (the kernel's output) into an MCP tool result.
 *
 * The response content becomes text (JSON-stringified when it isn't already a string), and a
 * status code `>= 400` marks the result as an error so the agent knows the call failed.
 *
 * @param response - The outgoing response produced by the kernel.
 * @returns The MCP tool result.
 */
export function toContent (response: OutgoingResponse): CallToolResult {
  const statusCode = (response as { statusCode?: number }).statusCode ?? 200
  const content = (response as { content?: unknown }).content
  const text = typeof content === 'string' ? content : JSON.stringify(content ?? null)

  return statusCode >= 400
    ? { content: [{ type: 'text', text }], isError: true }
    : { content: [{ type: 'text', text }] }
}
