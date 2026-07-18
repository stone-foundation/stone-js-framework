# Interface: MetaAdapterErrorPage\<RawEventType, RawResponseType, ExecutionContextType\>

Represents an Adapter meta component error handler.

## Type Parameters

### RawEventType

`RawEventType`

### RawResponseType

`RawResponseType`

### ExecutionContextType

`ExecutionContextType`

## Properties

### adapterAlias?

```ts
optional adapterAlias: string;
```

***

### error?

```ts
optional error: any;
```

***

### isClass?

```ts
optional isClass: boolean;
```

***

### isFactory?

```ts
optional isFactory: boolean;
```

***

### layout?

```ts
optional layout: unknown;
```

***

### lazy?

```ts
optional lazy: boolean;
```

***

### module

```ts
module: 
  | AdapterErrorPageType<RawEventType, RawResponseType, ExecutionContextType>
| Laziable<AdapterErrorPageType<RawEventType, RawResponseType, ExecutionContextType>>;
```

***

### platform?

```ts
optional platform: string;
```
