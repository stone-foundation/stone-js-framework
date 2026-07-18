# Interface: AdapterErrorContext\<RawEventType, RawResponseType, ExecutionContextType\>

Class representing an AdapterErrorContext.

## Type Parameters

### RawEventType

`RawEventType`

### RawResponseType

`RawResponseType`

### ExecutionContextType

`ExecutionContextType`

## Properties

### executionContext

```ts
readonly executionContext: ExecutionContextType;
```

The executionContext of type ExecutionContextType.

***

### rawEvent

```ts
readonly rawEvent: RawEventType;
```

The rawEvent of type RawEventType.

***

### rawResponseBuilder

```ts
readonly rawResponseBuilder: IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>;
```

The rawResponseBuilder.
