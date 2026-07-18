# Class: ServerBuilder

The Server builder class.

## Constructors

### Constructor

```ts
new ServerBuilder(context): ServerBuilder;
```

Creates a new Server builder instance.

#### Parameters

##### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

The service container to manage dependencies.

#### Returns

`ServerBuilder`

## Methods

### build()

```ts
build(_event): Promise<void>;
```

Builds the application.

#### Parameters

##### \_event

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
dev(_event, restart?): Promise<void>;
```

Starts the development server.

#### Parameters

##### \_event

`IncomingEvent`

The incoming event.

##### restart?

`boolean`

Whether to restart the server.

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
preview(_event): void;
```

Previews the application.

#### Parameters

##### \_event

`IncomingEvent`

The incoming event.

#### Returns

`void`

***

### watchFiles()

```ts
watchFiles(cb): void;
```

Server Files watcher.

#### Parameters

##### cb

() => `void` \| `Promise`\<`void`\>

The callback function.

#### Returns

`void`
