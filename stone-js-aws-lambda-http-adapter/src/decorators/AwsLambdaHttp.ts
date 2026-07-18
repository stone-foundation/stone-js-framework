import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { awsLambdaHttpAdapterBlueprint, AwsLambdaHttpAdapterAdapterConfig } from '../options/AwsLambdaHttpAdapterBlueprint'

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
export const AwsLambdaHttp = <T extends ClassType = ClassType>(options: AwsLambdaHttpOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which would leak options across classes and tests). cloneValue recreates plain
    // objects/arrays while keeping functions and class references intact.
    const blueprint = cloneValue(awsLambdaHttpAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
