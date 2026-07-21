import { ErrorOptions, IntegrationError } from '@stone-js/core'

/**
 * Thrown when the API Gateway WebSocket adapter is misused or a required AWS SDK is missing.
 */
export class ApiGatewayWsAdapterError extends IntegrationError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ApiGatewayWsAdapterError'
  }
}
