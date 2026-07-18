# Function: defineHookListener()

```ts
function defineHookListener<U>(module, options): Partial<StoneBlueprint>;
```

Defines a lifecycle hook listener for the application.

This function allows you to declaratively register a function to a specific lifecycle hook
such as `onInit`, `onTerminate`, `onHandlingEvent`, etc.

## Type Parameters

### U

`U` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

## Parameters

### module

[`LifecycleHookListener`](../../../declarations/type-aliases/LifecycleHookListener.md)\<[`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md), `any`, `any`, `U`\>

The hook function to be registered.

### options

Hook configuration, including the `name` of the lifecycle hook.

#### name

[`HookName`](../../../declarations/type-aliases/HookName.md)

## Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A partial StoneBlueprint with the lifecycle hook injected.

## Example

```ts
defineHookListener(onInitFunction, { name: 'onInit' })
```
