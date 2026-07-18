# Type Alias: AdapterErrorHandlerType\<RawEventType, RawResponseType, ExecutionContextType\>

```ts
type AdapterErrorHandlerType<RawEventType, RawResponseType, ExecutionContextType> = 
  | IAdapterErrorHandlerClass<RawEventType, RawResponseType, ExecutionContextType>
  | FactoryAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>
| FunctionalAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>;
```

AdapterErrorHandler Type.

Represents an error handler which can either be a class, a simple function or a factory function.

## Type Parameters

### RawEventType

`RawEventType`

### RawResponseType

`RawResponseType`

### ExecutionContextType

`ExecutionContextType`
