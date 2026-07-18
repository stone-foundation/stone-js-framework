# Class: CoreServiceProvider

Class representing a CoreServiceProvider.

The CoreServiceProvider is responsible for managing the core services,
listeners, subscribers, and adapters required by the application.
It interacts with the service container to bind and resolve dependencies,
ensuring all components are available when needed.

## Author

Mr. Stone <evensstone@gmail.com>

## Implements

- [`IServiceProvider`](../../../declarations/interfaces/IServiceProvider.md)

## Constructors

### Constructor

```ts
new CoreServiceProvider(container): CoreServiceProvider;
```

Create a new instance of CoreServiceProvider.

#### Parameters

##### container

[`CoreServiceProviderOptions`](../interfaces/CoreServiceProviderOptions.md)

The service container to manage dependencies.

#### Returns

`CoreServiceProvider`

#### Throws

If the Blueprint config or EventEmitter is not bound to the container.

## Methods

### boot()

```ts
boot(): Promise<void>;
```

Boot core components.

This method is used to bootstrap subscribers.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IServiceProvider`](../../../declarations/interfaces/IServiceProvider.md).[`boot`](../../../declarations/interfaces/IServiceProvider.md#boot)

***

### register()

```ts
register(): void;
```

Register core components in the service container.

This method registers services, listeners, adapters, and aliases in the container.

#### Returns

`void`

#### Implementation of

[`IServiceProvider`](../../../declarations/interfaces/IServiceProvider.md).[`register`](../../../declarations/interfaces/IServiceProvider.md#register)
