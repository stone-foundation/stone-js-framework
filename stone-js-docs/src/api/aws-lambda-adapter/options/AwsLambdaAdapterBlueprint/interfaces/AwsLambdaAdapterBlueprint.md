# Interface: AwsLambdaAdapterBlueprint

Blueprint interface for the AWS Lambda Adapter.

This interface extends `StoneBlueprint` and defines the structure of the
AWS Lambda adapter blueprint used in the Stone.js framework. It includes
a `stone` object with an array of `AwsLambdaAdapterConfig` items.

## Extends

- `StoneBlueprint`

## Indexable

```ts
[key: string]: unknown
```

Allow adding any additional custom properties.
The value of the custom properties can be of any type, depending on user requirements.
