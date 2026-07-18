# Class: ConsoleErrorHandler

Class representing an ConsoleErrorHandler.

Kernel level error handler for CLI applications.

## Implements

- `IErrorHandler`\<`IncomingEvent`\>

## Constructors

### Constructor

```ts
new ConsoleErrorHandler(context): ConsoleErrorHandler;
```

Create an ConsoleErrorHandler.

#### Parameters

##### context

[`ConsoleContext`](../../declarations/interfaces/ConsoleContext.md)

The service container to manage dependencies.

#### Returns

`ConsoleErrorHandler`

## Methods

### handle()

```ts
handle(error): OutgoingResponse;
```

Handle an error.

#### Parameters

##### error

[`CliError`](../../errors/CliError/classes/CliError.md)

The error to handle.

#### Returns

`OutgoingResponse`

The outgoing http response.

#### Implementation of

```ts
IErrorHandler.handle
```
