# Interface: RoutingOptions

Options for the `Routing` decorator, extending router configuration.

## Extends

- `Partial`\<[`RouterConfig`](../../../options/RouterBlueprint/interfaces/RouterConfig.md)\>

## Properties

### bindings?

```ts
optional bindings: Record<string, 
  | BindingResolver
| IBoundModel>;
```

Custom function bindings for specific route behaviors.

#### Inherited from

```ts
Partial.bindings
```

***

### defaults?

```ts
optional defaults: Record<string, unknown>;
```

Default parameter values for routes.

#### Inherited from

```ts
Partial.defaults
```

***

### definitions?

```ts
optional definitions: RouteDefinition<StoneIncomingEvent, unknown>[];
```

Array of route definitions to be included in the router.

#### Inherited from

```ts
Partial.definitions
```

***

### dependencyResolver?

```ts
optional dependencyResolver: DependencyResolver;
```

Resolver used to resolve dependencies.

#### Inherited from

```ts
Partial.dependencyResolver
```

***

### dispatchers?

```ts
optional dispatchers: IDispatchers<StoneIncomingEvent, unknown>;
```

Dispatchers used for handling callable and controller-based routes.

#### Inherited from

```ts
Partial.dispatchers
```

***

### eventEmitter?

```ts
optional eventEmitter: IEventEmitter;
```

Custom event emitter for handling application events.

#### Inherited from

```ts
Partial.eventEmitter
```

***

### matchers?

```ts
optional matchers: IMatcher<StoneIncomingEvent, unknown>[];
```

List of matchers used to validate and match routes.

#### Inherited from

```ts
Partial.matchers
```

***

### maxDepth?

```ts
optional maxDepth: number;
```

Maximum depth allowed in route definitions.

#### Inherited from

```ts
Partial.maxDepth
```

***

### middleware?

```ts
optional middleware: MixedPipe<StoneIncomingEvent, unknown>[];
```

List of middleware applied during route resolution.

#### Inherited from

```ts
Partial.middleware
```

***

### prefix?

```ts
optional prefix: string;
```

Base path prefix applied to all routes.

#### Inherited from

```ts
Partial.prefix
```

***

### rules?

```ts
optional rules: Record<string, RegExp>;
```

Custom rules for route matching, defined as regular expressions.

#### Inherited from

```ts
Partial.rules
```

***

### skipMiddleware?

```ts
optional skipMiddleware: boolean;
```

Skips middleware execution for specific routes.

#### Inherited from

```ts
Partial.skipMiddleware
```

***

### strict?

```ts
optional strict: boolean;
```

Enables strict path matching.

#### Inherited from

```ts
Partial.strict
```
