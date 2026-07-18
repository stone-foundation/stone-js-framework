# Class: AppBuilder

The App builder class.

## Constructors

### Constructor

```ts
new AppBuilder(context): AppBuilder;
```

Creates a new App builder instance.

#### Parameters

##### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

The service container to manage dependencies.

#### Returns

`AppBuilder`

## Methods

### build()

```ts
build(event): Promise<void>;
```

Builds the application.

#### Parameters

##### event

`IncomingEvent`

The incoming event.

#### Returns

`Promise`\<`void`\>
