# Type Alias: LifecycleHookListener\<BlueprintType, AdapterContextType, RawResponseType, IncomingEventType, OutgoingResponseType\>

```ts
type LifecycleHookListener<BlueprintType, AdapterContextType, RawResponseType, IncomingEventType, OutgoingResponseType> = 
  | BlueprintHookListener<BlueprintType>
  | PipelineHookListener<BlueprintContext<BlueprintType>, BlueprintType, any[]>
  | AdapterHookListener<AdapterContextType>
  | PipelineHookListener<AdapterContextType, AdapterEventBuilderType<RawResponseType>, any[]>
  | KernelHookListener
| PipelineHookListener<IncomingEventType, OutgoingResponseType, any[]>;
```

Represents the application lifecycle hooks listeners.

## Type Parameters

### BlueprintType

`BlueprintType` *extends* [`IBlueprint`](IBlueprint.md) = [`IBlueprint`](IBlueprint.md)

### AdapterContextType

`AdapterContextType` = `unknown`

### RawResponseType

`RawResponseType` = `unknown`

### IncomingEventType

`IncomingEventType` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` *extends* [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md) = [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md)
