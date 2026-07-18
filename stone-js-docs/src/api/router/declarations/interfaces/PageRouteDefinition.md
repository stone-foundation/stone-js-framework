# Interface: PageRouteDefinition\<IncomingEventType, OutgoingResponseType\>

Represents a page route definition.

## Extends

- [`RouteDefinition`](RouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\>

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

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`bindings`](RouteDefinition.md#bindings)

***

### children?

```ts
optional children: RouteDefinition<IncomingEventType, OutgoingResponseType>[];
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`children`](RouteDefinition.md#children)

***

### defaults?

```ts
optional defaults: Record<string, unknown>;
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`defaults`](RouteDefinition.md#defaults)

***

### domain?

```ts
optional domain: string | string[];
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`domain`](RouteDefinition.md#domain)

***

### excludeMiddleware?

```ts
optional excludeMiddleware: PipeType<IncomingEventType, OutgoingResponseType>[];
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`excludeMiddleware`](RouteDefinition.md#excludemiddleware)

***

### fallback?

```ts
optional fallback: boolean;
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`fallback`](RouteDefinition.md#fallback)

***

### handler?

```ts
optional handler: MixedEventHandler<IncomingEventType, OutgoingResponseType>;
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`handler`](RouteDefinition.md#handler)

***

### isInternalHeader?

```ts
optional isInternalHeader: boolean;
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`isInternalHeader`](RouteDefinition.md#isinternalheader)

***

### method?

```ts
optional method: HttpMethod;
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`method`](RouteDefinition.md#method)

***

### methods?

```ts
optional methods: undefined;
```

#### Overrides

[`RouteDefinition`](RouteDefinition.md).[`methods`](RouteDefinition.md#methods)

***

### middleware?

```ts
optional middleware: MixedPipe<IncomingEventType, OutgoingResponseType>[];
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`middleware`](RouteDefinition.md#middleware)

***

### name?

```ts
optional name: string;
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`name`](RouteDefinition.md#name)

***

### path

```ts
path: string | string[];
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`path`](RouteDefinition.md#path)

***

### protocol?

```ts
optional protocol: string | string[];
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`protocol`](RouteDefinition.md#protocol)

***

### redirect?

```ts
optional redirect: 
  | string
  | Record<string, unknown>
| RouteDefinitionRedirect<IncomingEventType, unknown>;
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`redirect`](RouteDefinition.md#redirect)

***

### rules?

```ts
optional rules: Record<string, string | RegExp>;
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`rules`](RouteDefinition.md#rules)

***

### strict?

```ts
optional strict: boolean;
```

#### Inherited from

[`RouteDefinition`](RouteDefinition.md).[`strict`](RouteDefinition.md#strict)
