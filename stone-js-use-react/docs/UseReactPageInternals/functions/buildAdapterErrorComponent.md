# Function: buildAdapterErrorComponent()

```ts
function buildAdapterErrorComponent<RawEventType, RawResponseType, ExecutionContextType>(
   blueprint, 
   context, 
   statusCode, 
error): Promise<ReactNode>;
```

Get adapter error component.

This error handler is different from the kernel error handler.
Because there is no container at adapter level.

## Type Parameters

### RawEventType

`RawEventType`

### RawResponseType

`RawResponseType`

### ExecutionContextType

`ExecutionContextType`

## Parameters

### blueprint

`IBlueprint`

The blueprint.

### context

`AdapterErrorContext`\<`RawEventType`, `RawResponseType`, `ExecutionContextType`\>

The context of the adapter.

### statusCode

`number`

The status code of the error.

### error

`any`

The error object.

## Returns

`Promise`\<`ReactNode`\>

The resolved layout element.
