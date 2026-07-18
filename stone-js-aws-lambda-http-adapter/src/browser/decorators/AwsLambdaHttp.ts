import { classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { AwsLambdaHttpAdapterAdapterConfig } from '../../options/AwsLambdaHttpAdapterBlueprint'

/**
 * Configuration options for the `AwsLambdaHttp` decorator.
 * These options extend the default AWS Lambda HTTP adapter configuration.
 */
export interface AwsLambdaHttpOptions extends Partial<AwsLambdaHttpAdapterAdapterConfig> {}

/**
 * A Stone.js decorator that integrates the AWS Lambda HTTP Adapter with a class.
 *
 * This decorator modifies the class to seamlessly enable AWS Lambda HTTP as the
 * execution environment for a Stone.js application. By applying this decorator,
 * the class is automatically configured with the necessary blueprint for AWS Lambda HTTP.
 *
 * NB: This decorator is stubbed for browser environments compatibility and does not
 * perform any actual functionality in the browser. It is intended for use in Node.js environments
 * where the Node.js HTTP adapter is applicable.
 *
 * @template T - The type of the class being decorated. Defaults to `ClassType`.
 * @param options - Optional configuration to customize the AWS Lambda HTTP Adapter.
 *
 * @returns A class decorator that applies the AWS Lambda HTTP adapter configuration.
 *
 * @example
 * ```typescript
 * import { AwsLambdaHttp } from '@stone-js/aws-lambda-http-adapter';
 *
 * @AwsLambdaHttp({
 *   alias: 'MyAwsLambdaHttpAdapter',
 *   current: true,
 * })
 * class App {
 *   // Your application logic here
 * }
 * ```
 */
export const AwsLambdaHttp = <T extends ClassType = ClassType>(_options: AwsLambdaHttpOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((_target: T, _context: ClassDecoratorContext<T>): undefined => {})
}
