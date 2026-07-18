# Function: isHandlerHasHook()

```ts
function isHandlerHasHook<HandlerType>(handler, hookName): handler is HandlerType & Record<keyof HandlerType, (args: any[]) => any>;
```

Check if the provided handler has the specified hook.

## Type Parameters

### HandlerType

`HandlerType`

## Parameters

### handler

`any`

The handler to check.

### hookName

keyof `HandlerType`

The hook name to check.

## Returns

`handler is HandlerType & Record<keyof HandlerType, (args: any[]) => any>`

`true` if the handler has the specified hook, otherwise `false`.
