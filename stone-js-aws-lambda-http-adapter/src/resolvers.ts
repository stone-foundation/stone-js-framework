import { AdapterResolver, IBlueprint } from '@stone-js/core'
import { AwsLambdaHttpAdapter } from './AWSLambdaHttpAdapter'

/**
 * Adapter resolver for AWS Lambda HTTP adapter.
 *
 * Creates and configures an `AWSLambdaHttpAdapter` for handling HTTP events in AWS Lambda.
 *
 * @param blueprint - The `IBlueprint` providing configuration and dependencies.
 * @returns An `AWSLambdaHttpAdapter` instance.
 */
export const awsLambdaHttpAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return AwsLambdaHttpAdapter.create(blueprint)
}
