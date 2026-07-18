# Interface: RouteMapperOptions\<IncomingEventType, OutgoingResponseType\>

Configuration options for the RouteMapper.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

## Properties

### bindings?

```ts
optional bindings: Record<string, 
  | BindingResolver
| IBoundModel>;
```

***

### defaults?

```ts
optional defaults: Record<string, unknown>;
```

***

### dependencyResolver?

```ts
optional dependencyResolver: DependencyResolver;
```

***

### dispatchers

```ts
dispatchers: IDispatchers<IncomingEventType, OutgoingResponseType>;
```

***

### matchers

```ts
matchers: IMatcher<IncomingEventType, OutgoingResponseType>[];
```

***

### maxDepth

```ts
maxDepth: number;
```

***

### prefix?

```ts
optional prefix: string;
```

***

### rules?

```ts
optional rules: Record<string, RegExp>;
```

***

### strict?

```ts
optional strict: boolean;
```
