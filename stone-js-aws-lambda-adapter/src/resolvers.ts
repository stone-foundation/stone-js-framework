import { AwsLambdaAdapter } from './AWSLambdaAdapter'
import { AdapterResolver, IBlueprint } from '@stone-js/core'

/**
 * Adapter resolver for generic AWS Lambda adapter.
 *
 * Creates and configures an `AWSLambdaAdapter` for handling generic events in AWS Lambda.
 *
 * @param blueprint - The `IBlueprint` providing configuration and dependencies.
 * @returns An `AWSLambdaAdapter` instance.
 */
export const awsLambdaAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return AwsLambdaAdapter.create(blueprint)
}
