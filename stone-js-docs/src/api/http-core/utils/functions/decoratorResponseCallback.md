# Function: decoratorResponseCallback()

```ts
function decoratorResponseCallback<TTarget, TFunction, UReturn>(target, responseCallback): TFunction;
```

Decorator response callback.

## Type Parameters

### TTarget

`TTarget`

### TFunction

`TFunction`

### UReturn

`UReturn` *extends* [`OutgoingHttpResponse`](../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)

## Parameters

### target

`TTarget`

The target function.

### responseCallback

(`content`) => `Promise`\<`UReturn`\>

The response callback.

## Returns

`TFunction`

The function with the response callback.
