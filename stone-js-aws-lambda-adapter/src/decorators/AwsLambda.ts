import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { awsLambdaAdapterBlueprint, AwsLambdaAdapterAdapterConfig } from '../options/AwsLambdaAdapterBlueprint'

/**
 * Configuration options for the `AwsLambda` decorator.
 * These options extend the default AWS Lambda adapter configuration.
 */
export interface AwsLambdaOptions extends Partial<AwsLambdaAdapterAdapterConfig> {}

/**
 * A Stone.js decorator that integrates the AWS Lambda Adapter with a class.
 *
 * This decorator modifies the class to seamlessly enable AWS Lambda as the
 * execution environment for a Stone.js application. By applying this decorator,
 * the class is automatically configured with the necessary blueprint for AWS Lambda.
 *
 * @template T - The type of the class being decorated. Defaults to `ClassType`.
 * @param options - Optional configuration to customize the AWS Lambda Adapter.
 *
 * @returns A class decorator that applies the AWS Lambda adapter configuration.
 *
 * @example
 * ```typescript
 * import { AwsLambda } from '@stone-js/aws-lambda-adapter';
 *
 * @AwsLambda({
 *   alias: 'MyAWSLambda',
 * })
 * class App {
 *   // Your application logic here
 * }
 * ```
 */
export const AwsLambda = <T extends ClassType = ClassType>(options: AwsLambdaOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which would leak options across classes and tests).
    const blueprint = cloneValue(awsLambdaAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
