# Interface: BlueprintConfig\<BlueprintType, ContextType\>

Blueprint options.

This interface defines the configuration options for the blueprint builder.
It includes middleware for building the blueprint and the default priority for pipes.

## Type Parameters

### BlueprintType

`BlueprintType` *extends* [`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md) = [`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md)

### ContextType

`ContextType` *extends* [`BlueprintContext`](../../../declarations/interfaces/BlueprintContext.md)\<`BlueprintType`\> = [`BlueprintContext`](../../../declarations/interfaces/BlueprintContext.md)\<`BlueprintType`\>

## Properties

### defaultMiddlewarePriority?

```ts
optional defaultMiddlewarePriority: number;
```

The default priority for pipes, used when a specific pipe does not have an explicitly set priority.
This value helps to determine the order in which middleware pipes are executed.
Default value is set to 10.

***

### middleware

```ts
middleware: MixedPipe<ContextType, BlueprintType>[];
```

Middleware used for processing data during the blueprint construction.
The middleware array can include core pipes and any additional custom pipes.
