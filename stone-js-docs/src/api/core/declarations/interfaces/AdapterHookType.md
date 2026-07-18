# Interface: AdapterHookType\<AdapterContextType, RawResponseType\>

AdapterHook type.

Represents lifecycle hooks that can be defined for the adapter, such as initialization, pre-handling, and termination.

## Type Parameters

### AdapterContextType

`AdapterContextType` = `any`

### RawResponseType

`RawResponseType` = `any`

## Properties

### onAdapterMiddlewareProcessed?

```ts
optional onAdapterMiddlewareProcessed: PipelineHookListener<AdapterContextType, IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>, any[]>[];
```

***

### onBuildingIncomingEvent?

```ts
optional onBuildingIncomingEvent: AdapterHookListener<AdapterContextType>[];
```

***

### onBuildingRawResponse?

```ts
optional onBuildingRawResponse: AdapterHookListener<AdapterContextType>[];
```

***

### onHandlingAdapterError?

```ts
optional onHandlingAdapterError: AdapterHookListener<AdapterContextType>[];
```

***

### onProcessingAdapterMiddleware?

```ts
optional onProcessingAdapterMiddleware: PipelineHookListener<AdapterContextType, IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>, any[]>[];
```

***

### onStart?

```ts
optional onStart: AdapterHookListener<AdapterContextType>[];
```

***

### onStop?

```ts
optional onStop: AdapterHookListener<AdapterContextType>[];
```
