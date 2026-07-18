# Interface: RoutingOptions

Options for the `Routing` decorator, extending router configuration.

## Extends

- `Partial`\<[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md)\>

## Properties

### bindings?

```ts
optional bindings?: Record<string, 
  | BindingResolver
| IBoundModel>;
```

Custom function bindings for specific route behaviors.

#### Inherited from

[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md).[`bindings`](../../../options/RouterBlueprint/interfaces/RouterConfig.md#bindings)

***

### defaults?

```ts
optional defaults?: Record<string, unknown>;
```

Default parameter values for routes.

#### Inherited from

[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md).[`defaults`](../../../options/RouterBlueprint/interfaces/RouterConfig.md#defaults)

***

### definitions?

```ts
optional definitions?: RouteDefinition<StoneIncomingEvent, unknown>[];
```

Array of route definitions to be included in the router.

#### Inherited from

```ts
Partial.definitions
```

***

### dependencyResolver?

```ts
optional dependencyResolver?: DependencyResolver;
```

Resolver used to resolve dependencies.

#### Inherited from

[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md).[`dependencyResolver`](../../../options/RouterBlueprint/interfaces/RouterConfig.md#dependencyresolver)

***

### dispatchers?

```ts
optional dispatchers?: IDispatchers<StoneIncomingEvent, unknown>;
```

Dispatchers used for handling callable and controller-based routes.

#### Inherited from

```ts
Partial.dispatchers
```

***

### eventEmitter?

```ts
optional eventEmitter?: IEventEmitter;
```

Custom event emitter for handling application events.

#### Inherited from

[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md).[`eventEmitter`](../../../options/RouterBlueprint/interfaces/RouterConfig.md#eventemitter)

***

### matchers?

```ts
optional matchers?: IMatcher<StoneIncomingEvent, unknown>[];
```

List of matchers used to validate and match routes.

#### Inherited from

```ts
Partial.matchers
```

***

### maxDepth?

```ts
optional maxDepth?: number;
```

Maximum depth allowed in route definitions.

#### Inherited from

[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md).[`maxDepth`](../../../options/RouterBlueprint/interfaces/RouterConfig.md#maxdepth)

***

### maxUriLength?

```ts
optional maxUriLength?: number;
```

Maximum request URI length (characters) accepted before matching. Defaults to 2048.

#### Inherited from

[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md).[`maxUriLength`](../../../options/RouterBlueprint/interfaces/RouterConfig.md#maxurilength)

***

### middleware?

```ts
optional middleware?: MixedPipe<StoneIncomingEvent, unknown>[];
```

List of middleware applied during route resolution.

#### Inherited from

```ts
Partial.middleware
```

***

### prefix?

```ts
optional prefix?: string;
```

Base path prefix applied to all routes.

#### Inherited from

[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md).[`prefix`](../../../options/RouterBlueprint/interfaces/RouterConfig.md#prefix)

***

### protocolPolicy?

```ts
optional protocolPolicy?: ProtocolPolicy;
```

Protocol Policy for all routes.

#### Inherited from

[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md).[`protocolPolicy`](../../../options/RouterBlueprint/interfaces/RouterConfig.md#protocolpolicy)

***

### rules?

```ts
optional rules?: Record<string, RegExp>;
```

Custom rules for route matching, defined as regular expressions.

#### Inherited from

[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md).[`rules`](../../../options/RouterBlueprint/interfaces/RouterConfig.md#rules)

***

### skipMiddleware?

```ts
optional skipMiddleware?: boolean;
```

Skips middleware execution for specific routes.

#### Inherited from

[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md).[`skipMiddleware`](../../../options/RouterBlueprint/interfaces/RouterConfig.md#skipmiddleware)

***

### strict?

```ts
optional strict?: boolean;
```

Enables strict path matching.

#### Inherited from

[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md).[`strict`](../../../options/RouterBlueprint/interfaces/RouterConfig.md#strict)
