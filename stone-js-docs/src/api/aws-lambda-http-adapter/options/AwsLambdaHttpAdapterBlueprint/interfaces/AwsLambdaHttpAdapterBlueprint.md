# Interface: AwsLambdaHttpAdapterBlueprint

Blueprint interface for the AWS Lambda Http Adapter.

This interface extends `StoneBlueprint` and defines the structure of the
AWS Lambda Http adapter blueprint used in the Stone.js framework. It includes
a `stone` object with an array of `AwsLambdaHttpAdapterConfig` items.

## Extends

- `StoneBlueprint`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

## Indexable

```ts
[key: string]: unknown
```

Allow adding any additional custom properties.
The value of the custom properties can be of any type, depending on user requirements.

## Properties

### stone

```ts
stone: AwsLambdaHttpAdapterConfig;
```

Application-level settings, including environment, middleware, logging, and service registration.

#### Overrides

```ts
StoneBlueprint.stone
```
