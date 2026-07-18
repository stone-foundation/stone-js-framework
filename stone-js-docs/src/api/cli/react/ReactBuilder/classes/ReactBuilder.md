# Class: ReactBuilder

The React builder class.

## Constructors

### Constructor

```ts
new ReactBuilder(context): ReactBuilder;
```

Creates a new React builder instance.

#### Parameters

##### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

The service container to manage dependencies.

#### Returns

`ReactBuilder`

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

***

### console()

```ts
console(_event): Promise<void>;
```

Runs the application in the console.

#### Parameters

##### \_event

`IncomingEvent`

The incoming event.

#### Returns

`Promise`\<`void`\>

***

### dev()

```ts
dev(_event): Promise<void>;
```

Starts the development server.

#### Parameters

##### \_event

`IncomingEvent`

The incoming event.

#### Returns

`Promise`\<`void`\>

***

### export()

```ts
export(event): Promise<void>;
```

Exports server files.

#### Parameters

##### event

`IncomingEvent`

The incoming event.

#### Returns

`Promise`\<`void`\>

***

### preview()

```ts
preview(_event): Promise<void>;
```

Previews the application.

#### Parameters

##### \_event

`IncomingEvent`

The incoming event.

#### Returns

`Promise`\<`void`\>
