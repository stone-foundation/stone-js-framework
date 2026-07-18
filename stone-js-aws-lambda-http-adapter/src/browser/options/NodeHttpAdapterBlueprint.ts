import { AwsLambdaHttpAdapterBlueprint } from '../../options/AwsLambdaHttpAdapterBlueprint'

/**
 * Default blueprint configuration for the AWS Lambda Http Adapter.
 *
 * This blueprint defines the initial configuration for the AWS Lambda Http adapter
 * within the Stone.js framework. It includes:
 * - An alias for the AWS Lambda platform (`AWS_LAMBDA_HTTP_PLATFORM`).
 * - A default resolver function (currently a placeholder).
 * - Middleware, hooks, and state flags (`current`, `default`, `preferred`).
 *
 * NB: This is a stub for browser environments and does not perform any actual functionality in the browser.
 */
export const awsLambdaHttpAdapterBlueprint: AwsLambdaHttpAdapterBlueprint = { stone: { http: {}, adapters: [] } }
