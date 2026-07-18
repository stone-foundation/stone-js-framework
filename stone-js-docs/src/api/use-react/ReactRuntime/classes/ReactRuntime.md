# Class: ReactRuntime

Class representing a ReactRuntime.

This class is responsible for handling the React runtime environment,
including create snapshots and managing errors.

## Constructors

### Constructor

```ts
new ReactRuntime(options): ReactRuntime;
```

Create a ReactRuntime.

#### Parameters

##### options

[`ReactRuntimeOptions`](../interfaces/ReactRuntimeOptions.md)

ReactRuntime options.

#### Returns

`ReactRuntime`

## Properties

### instance?

```ts
static optional instance: ReactRuntime;
```

The ReactRuntime instance.

## Methods

### head()

```ts
head(value): void;
```

Set html head tags.

This method will set the head elements in the document.

#### Parameters

##### value

`HeadContext`

The head context to set.

#### Returns

`void`

***

### snapshot()

```ts
snapshot<T>(key, handler): Promise<T>;
```

Create a snapshot.

This method will create a snapshot of the current event.
If the environment is server, it will create a snapshot.
If the environment is client, it will return the snapshot.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

The key to store the snapshot.

##### handler

(`container?`) => `Promiseable`\<`T`\>

The handler to create the snapshot.

#### Returns

`Promise`\<`T`\>

The snapshot value.

***

### throwError()

```ts
throwError(error, statusCode): Promise<void>;
```

Throw an error.

This method will handle the error and render the error component.
If no error handler is found, the error will be thrown.

#### Parameters

##### error

`any`

The error to throw.

##### statusCode

`number` = `500`

The status code to return.

#### Returns

`Promise`\<`void`\>

void

#### Throws

error
