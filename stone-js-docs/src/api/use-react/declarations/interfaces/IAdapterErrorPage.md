# Interface: IAdapterErrorPage\<RawEventType, RawResponseType, ExecutionContextType\>

Represents an Adapter component error handler.

## Type Parameters

### RawEventType

`RawEventType`

### RawResponseType

`RawResponseType`

### ExecutionContextType

`ExecutionContextType`

## Properties

### handle?

```ts
optional handle: FunctionalAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>;
```

***

### render()

```ts
render: (context) => ReactNode;
```

#### Parameters

##### context

[`AdapterErrorPageRenderContext`](AdapterErrorPageRenderContext.md)\<`any`\>

#### Returns

`ReactNode`
