import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { apiGatewayWsAdapterBlueprint, ApiGatewayWsAdapterAdapterConfig } from '../options/ApiGatewayWsAdapterBlueprint'

/**
 * Options for the `@ApiGatewayWs` decorator.
 */
export interface ApiGatewayWsOptions extends Partial<ApiGatewayWsAdapterAdapterConfig> {}

/**
 * Class decorator: enable the AWS API Gateway WebSocket adapter for a Stone.js application.
 *
 * Registers the `aws_apigw_ws` adapter. Combine with `@Realtime()` configured to use the
 * `ApiGatewayWsBroadcaster` (DynamoDB-backed presence) so gateways, channels and presence work
 * across the ephemeral Lambda invocations of a WebSocket API.
 *
 * @param options - Optional adapter configuration.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { ApiGatewayWs } from '@stone-js/aws-apigw-ws-adapter'
 *
 * @ApiGatewayWs()
 * @StoneApp({ name: 'app' })
 * export class Application {}
 * ```
 */
export const ApiGatewayWs = <T extends ClassType = ClassType>(options: ApiGatewayWsOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(apiGatewayWsAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
