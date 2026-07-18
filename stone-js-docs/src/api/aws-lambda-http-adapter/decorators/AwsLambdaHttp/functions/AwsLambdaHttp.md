# Function: AwsLambdaHttp()

```ts
function AwsLambdaHttp<T>(options): ClassDecorator;
```

A Stone.js decorator that integrates the AWS Lambda HTTP Adapter with a class.

This decorator modifies the class to seamlessly enable AWS Lambda HTTP as the
execution environment for a Stone.js application. By applying this decorator,
the class is automatically configured with the necessary blueprint for AWS Lambda HTTP.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

The type of the class being decorated. Defaults to `ClassType`.

## Parameters

### options

[`AwsLambdaHttpOptions`](../interfaces/AwsLambdaHttpOptions.md) = `{}`

Optional configuration to customize the AWS Lambda HTTP Adapter.

## Returns

`ClassDecorator`

A class decorator that applies the AWS Lambda HTTP adapter configuration.

## Example

```typescript
import { AwsLambdaHttp } from '@stone-js/aws-lambda-http-adapter';

@AwsLambdaHttp({
  alias: 'MyAwsLambdaHttpAdapter',
  current: true,
})
class App {
  // Your application logic here
}
```
