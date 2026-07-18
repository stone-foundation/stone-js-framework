# Function: defineHookListeners()

```ts
function defineHookListeners<T>(lifecycleHooks): Partial<StoneBlueprint>;
```

Defines a lifecycle hooks listeners for the application.

## Type Parameters

### T

`T` *extends* [`LifecycleHookType`](../../../declarations/type-aliases/LifecycleHookType.md)\<[`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md), `any`, `any`, `any`, `any`\> = [`LifecycleHookType`](../../../declarations/type-aliases/LifecycleHookType.md)\<[`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md), `any`, `any`, `any`, `any`\>

## Parameters

### lifecycleHooks

`T`

The hook function listeners to be registered.

## Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A partial StoneBlueprint with the lifecycle hook injected.
