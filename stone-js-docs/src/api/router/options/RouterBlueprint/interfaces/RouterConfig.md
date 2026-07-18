# Interface: RouterConfig\<IncomingEventType, OutgoingResponseType\>

Defines the configuration options for the router.

## Extends

- [`RouterOptions`](../../../declarations/interfaces/RouterOptions.md)\<`IncomingEventType`, `OutgoingResponseType`\>

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`StoneIncomingEvent`](../../../declarations/interfaces/StoneIncomingEvent.md) = [`StoneIncomingEvent`](../../../declarations/interfaces/StoneIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

## Properties

### bindings?

```ts
optional bindings: Record<string, 
  | BindingResolver
| IBoundModel>;
```

Custom function bindings for specific route behaviors.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`bindings`](../../../declarations/interfaces/RouterOptions.md#bindings)

***

### defaults?

```ts
optional defaults: Record<string, unknown>;
```

Default parameter values for routes.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`defaults`](../../../declarations/interfaces/RouterOptions.md#defaults)

***

### definitions

```ts
definitions: RouteDefinition<IncomingEventType, OutgoingResponseType>[];
```

Array of route definitions to be included in the router.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`definitions`](../../../declarations/interfaces/RouterOptions.md#definitions)

***

### dependencyResolver?

```ts
optional dependencyResolver: DependencyResolver;
```

Resolver used to resolve dependencies.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`dependencyResolver`](../../../declarations/interfaces/RouterOptions.md#dependencyresolver)

***

### dispatchers

```ts
dispatchers: IDispatchers<IncomingEventType, OutgoingResponseType>;
```

Dispatchers used for handling callable and controller-based routes.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`dispatchers`](../../../declarations/interfaces/RouterOptions.md#dispatchers)

***

### eventEmitter?

```ts
optional eventEmitter: IEventEmitter;
```

Custom event emitter for handling application events.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`eventEmitter`](../../../declarations/interfaces/RouterOptions.md#eventemitter)

***

### matchers

```ts
matchers: IMatcher<IncomingEventType, OutgoingResponseType>[];
```

List of matchers used to validate and match routes.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`matchers`](../../../declarations/interfaces/RouterOptions.md#matchers)

***

### maxDepth

```ts
maxDepth: number;
```

Maximum depth allowed in route definitions.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`maxDepth`](../../../declarations/interfaces/RouterOptions.md#maxdepth)

***

### middleware?

```ts
optional middleware: MixedPipe<IncomingEventType, OutgoingResponseType>[];
```

List of middleware applied during route resolution.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`middleware`](../../../declarations/interfaces/RouterOptions.md#middleware)

***

### prefix?

```ts
optional prefix: string;
```

Base path prefix applied to all routes.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`prefix`](../../../declarations/interfaces/RouterOptions.md#prefix)

***

### rules?

```ts
optional rules: Record<string, RegExp>;
```

Custom rules for route matching, defined as regular expressions.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`rules`](../../../declarations/interfaces/RouterOptions.md#rules)

***

### skipMiddleware?

```ts
optional skipMiddleware: boolean;
```

Skips middleware execution for specific routes.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`skipMiddleware`](../../../declarations/interfaces/RouterOptions.md#skipmiddleware)

***

### strict?

```ts
optional strict: boolean;
```

Enables strict path matching.

#### Inherited from

[`RouterOptions`](../../../declarations/interfaces/RouterOptions.md).[`strict`](../../../declarations/interfaces/RouterOptions.md#strict)
