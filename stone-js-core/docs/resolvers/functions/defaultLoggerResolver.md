# Function: defaultLoggerResolver()

```ts
function defaultLoggerResolver(blueprint): ConsoleLogger;
```

Default logger resolver function.

This function resolves the logger for the application, using the blueprint configuration.
By default, it creates a `ConsoleLogger` instance with the provided blueprint.

## Parameters

### blueprint

[`IBlueprint`](../../declarations/type-aliases/IBlueprint.md)

The blueprint configuration to use for the logger.

## Returns

[`ConsoleLogger`](../../logger/ConsoleLogger/classes/ConsoleLogger.md)

A `ConsoleLogger` instance.
