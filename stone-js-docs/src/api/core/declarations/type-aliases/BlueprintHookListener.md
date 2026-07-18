# Type Alias: BlueprintHookListener()\<BlueprintType, ContextType\>

```ts
type BlueprintHookListener<BlueprintType, ContextType> = (context) => Promiseable<void>;
```

BlueprintHookListener Type.

Represents a listener hook that can either be synchronous or asynchronous.

## Type Parameters

### BlueprintType

`BlueprintType` *extends* [`IBlueprint`](IBlueprint.md) = [`IBlueprint`](IBlueprint.md)

### ContextType

`ContextType` *extends* [`BlueprintContext`](../interfaces/BlueprintContext.md)\<`BlueprintType`\> = [`BlueprintContext`](../interfaces/BlueprintContext.md)\<`BlueprintType`\>

## Parameters

### context

`ContextType`

## Returns

[`Promiseable`](Promiseable.md)\<`void`\>
