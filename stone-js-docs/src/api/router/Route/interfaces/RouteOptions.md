# Interface: RouteOptions\<IncomingEventType, OutgoingResponseType\>

Defines the options for creating a `Route` instance.

## Extends

- [`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\>

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md)

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

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`bindings`](../../declarations/interfaces/RouteDefinition.md#bindings)

***

### children?

```ts
optional children: undefined;
```

#### Overrides

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`children`](../../declarations/interfaces/RouteDefinition.md#children)

***

### defaults?

```ts
optional defaults: Record<string, unknown>;
```

#### Inherited from

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`defaults`](../../declarations/interfaces/RouteDefinition.md#defaults)

***

### domain?

```ts
optional domain: string;
```

#### Overrides

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`domain`](../../declarations/interfaces/RouteDefinition.md#domain)

***

### excludeMiddleware?

```ts
optional excludeMiddleware: PipeType<IncomingEventType, OutgoingResponseType>[];
```

#### Inherited from

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`excludeMiddleware`](../../declarations/interfaces/RouteDefinition.md#excludemiddleware)

***

### fallback?

```ts
optional fallback: boolean;
```

#### Inherited from

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`fallback`](../../declarations/interfaces/RouteDefinition.md#fallback)

***

### handler?

```ts
optional handler: MixedEventHandler<IncomingEventType, OutgoingResponseType>;
```

#### Inherited from

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`handler`](../../declarations/interfaces/RouteDefinition.md#handler)

***

### isInternalHeader?

```ts
optional isInternalHeader: boolean;
```

#### Inherited from

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`isInternalHeader`](../../declarations/interfaces/RouteDefinition.md#isinternalheader)

***

### method

```ts
method: HttpMethod;
```

#### Overrides

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`method`](../../declarations/interfaces/RouteDefinition.md#method)

***

### methods?

```ts
optional methods: undefined;
```

#### Overrides

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`methods`](../../declarations/interfaces/RouteDefinition.md#methods)

***

### middleware?

```ts
optional middleware: MixedPipe<IncomingEventType, OutgoingResponseType>[];
```

#### Inherited from

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`middleware`](../../declarations/interfaces/RouteDefinition.md#middleware)

***

### name?

```ts
optional name: string;
```

#### Inherited from

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`name`](../../declarations/interfaces/RouteDefinition.md#name)

***

### path

```ts
path: string;
```

#### Overrides

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`path`](../../declarations/interfaces/RouteDefinition.md#path)

***

### protocol?

```ts
optional protocol: string;
```

#### Overrides

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`protocol`](../../declarations/interfaces/RouteDefinition.md#protocol)

***

### redirect?

```ts
optional redirect: 
  | string
  | Record<string, unknown>
| RouteDefinitionRedirect<IncomingEventType, unknown>;
```

#### Inherited from

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`redirect`](../../declarations/interfaces/RouteDefinition.md#redirect)

***

### rules?

```ts
optional rules: Record<string, string | RegExp>;
```

#### Inherited from

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`rules`](../../declarations/interfaces/RouteDefinition.md#rules)

***

### strict?

```ts
optional strict: boolean;
```

#### Inherited from

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md).[`strict`](../../declarations/interfaces/RouteDefinition.md#strict)
