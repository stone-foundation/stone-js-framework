# Interface: IBlueprintHook\<BlueprintType, ContextType\>

Blueprint Hook interface.

Represents a hook that can either be synchronous or asynchronous.

## Type Parameters

### BlueprintType

`BlueprintType` *extends* [`IBlueprint`](../type-aliases/IBlueprint.md) = [`IBlueprint`](../type-aliases/IBlueprint.md)

### ContextType

`ContextType` *extends* [`BlueprintContext`](BlueprintContext.md)\<`BlueprintType`\> = [`BlueprintContext`](BlueprintContext.md)\<`BlueprintType`\>

## Properties

### onBlueprintMiddlewareProcessed?

```ts
optional onBlueprintMiddlewareProcessed: PipelineHookListener<ContextType, BlueprintType, any[]>;
```

***

### onBlueprintPrepared?

```ts
optional onBlueprintPrepared: BlueprintHookListener<BlueprintType, ContextType>;
```

***

### onPreparingBlueprint?

```ts
optional onPreparingBlueprint: BlueprintHookListener<BlueprintType, ContextType>;
```

***

### onProcessingBlueprintMiddleware?

```ts
optional onProcessingBlueprintMiddleware: PipelineHookListener<ContextType, BlueprintType, any[]>;
```
