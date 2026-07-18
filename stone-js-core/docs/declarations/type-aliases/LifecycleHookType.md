# Type Alias: LifecycleHookType\<BlueprintType, AdapterContextType, RawResponseType, IncomingEventType, OutgoingResponseType\>

```ts
type LifecycleHookType<BlueprintType, AdapterContextType, RawResponseType, IncomingEventType, OutgoingResponseType> = BlueprintHookType<BlueprintType> & AdapterHookType<AdapterContextType, RawResponseType> & KernelHookType<IncomingEventType, OutgoingResponseType>;
```

Represents the application lifecycle hooks.

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
