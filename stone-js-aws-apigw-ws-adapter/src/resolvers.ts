import { AdapterResolver, IBlueprint } from '@stone-js/core'
import { ApiGatewayWsAdapter } from './ApiGatewayWsAdapter'

/**
 * Adapter resolver for the API Gateway WebSocket adapter.
 *
 * @param blueprint - The blueprint providing configuration and dependencies.
 * @returns An `ApiGatewayWsAdapter` instance.
 */
export const apiGatewayWsAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return ApiGatewayWsAdapter.create(blueprint)
}
