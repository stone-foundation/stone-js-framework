import { WsFrame, ApiGatewayWsEvent } from './declarations'

/**
 * Parse a raw WebSocket body into a {@link WsFrame}, returning `undefined` on malformed JSON.
 *
 * @param body - The raw body.
 * @returns The parsed frame, or `undefined`.
 */
export function parseFrame (body: unknown): WsFrame | undefined {
  try {
    const raw = typeof body === 'string' ? body : String(body)
    const frame = JSON.parse(raw)
    return (typeof frame === 'object' && frame !== null) ? frame as WsFrame : undefined
  } catch {
    return undefined
  }
}

/**
 * Build the API Gateway management endpoint (`https://<domain>/<stage>`) from an event.
 *
 * @param event - The API Gateway WebSocket event.
 * @returns The endpoint, or `undefined` when the domain is absent.
 */
export function managementEndpoint (event: ApiGatewayWsEvent): string | undefined {
  const { domainName, stage } = event.requestContext
  if (typeof domainName !== 'string') { return undefined }
  return typeof stage === 'string' ? `https://${domainName}/${stage}` : `https://${domainName}`
}
