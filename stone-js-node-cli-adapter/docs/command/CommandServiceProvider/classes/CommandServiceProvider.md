# Class: CommandServiceProvider

Class representing a CommandServiceProvider.
Responsible for registering router and application commands.

## Author

Mr. Stone <evensstone@gmail.com>

## Implements

- `IServiceProvider`

## Constructors

### Constructor

```ts
new CommandServiceProvider(container): CommandServiceProvider;
```

Create a new instance of CommandServiceProvider.

#### Parameters

##### container

[`CommandServiceProviderOptions`](../interfaces/CommandServiceProviderOptions.md)

The container instance for dependency resolution.

#### Returns

`CommandServiceProvider`

## Methods

### mustSkip()

```ts
mustSkip(): boolean;
```

Determines if this provider should be skipped.
Useful for registering the provider based on platform.

#### Returns

`boolean`

True if the provider should be skipped; otherwise, false.

#### Implementation of

```ts
IServiceProvider.mustSkip
```

***

### register()

```ts
register(): void;
```

Registers router components and application commands in the service container.

#### Returns

`void`

#### Implementation of

```ts
IServiceProvider.register
```
