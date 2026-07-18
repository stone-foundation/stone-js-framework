# Interface: RouteDefinition\<IncomingEventType, OutgoingResponseType\>

Represents the structure of a route definition.

## Extended by

- [`RouteOptions`](../../Route/interfaces/RouteOptions.md)
- [`PageRouteDefinition`](PageRouteDefinition.md)

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](IIncomingEvent.md) = [`IIncomingEvent`](IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

## Indexable

```ts
[k: string]: unknown
```

## Properties

### bindings?

```ts
optional bindings: Record<string, 
  | string
  | BindingResolver
| IBoundModel>;
```

***

### children?

```ts
optional children: RouteDefinition<IncomingEventType, OutgoingResponseType>[];
```

***

### defaults?

```ts
optional defaults: Record<string, unknown>;
```

***

### domain?

```ts
optional domain: string | string[];
```

***

### excludeMiddleware?

```ts
optional excludeMiddleware: PipeType<IncomingEventType, OutgoingResponseType>[];
```

***

### fallback?

```ts
optional fallback: boolean;
```

***

### handler?

```ts
optional handler: MixedEventHandler<IncomingEventType, OutgoingResponseType>;
```

***

### isInternalHeader?

```ts
optional isInternalHeader: boolean;
```

***

### method?

```ts
optional method: HttpMethod;
```

***

### methods?

```ts
optional methods: HttpMethod[];
```

***

### middleware?

```ts
optional middleware: MixedPipe<IncomingEventType, OutgoingResponseType>[];
```

***

### name?

```ts
optional name: string;
```

***

### path

```ts
path: string | string[];
```

***

### protocol?

```ts
optional protocol: string | string[];
```

***

### redirect?

```ts
optional redirect: 
  | string
  | Record<string, unknown>
| RouteDefinitionRedirect<IncomingEventType, unknown>;
```

***

### rules?

```ts
optional rules: Record<string, string | RegExp>;
```

***

### strict?

```ts
optional strict: boolean;
```
