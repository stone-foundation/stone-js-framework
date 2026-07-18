# Class: ConsoleLogger

Console Logger class.

This class implements the ILogger interface and uses either the native console object or a custom logging tool.

## Example

```typescript
const logger = ConsoleLogger.create({ blueprint });
logger.info('Application started');
```

## Implements

- [`ILogger`](../../../declarations/interfaces/ILogger.md)

## Constructors

### Constructor

```ts
new ConsoleLogger(options): ConsoleLogger;
```

Constructs a ConsoleLogger instance.

#### Parameters

##### options

[`LoggerOptions`](../interfaces/LoggerOptions.md)

Options for creating the ConsoleLogger.

#### Returns

`ConsoleLogger`

## Methods

### debug()

```ts
debug(message, ...optionalParams): void;
```

Logs debug-level messages, used for debugging purposes.

#### Parameters

##### message

`string`

The message to log.

##### optionalParams

...`unknown`[]

Optional parameters to log.

#### Returns

`void`

#### Implementation of

[`ILogger`](../../../declarations/interfaces/ILogger.md).[`debug`](../../../declarations/interfaces/ILogger.md#debug)

***

### error()

```ts
error(message, ...optionalParams): void;
```

Logs errors, used to report errors or exceptions.

#### Parameters

##### message

`string`

The error message to log.

##### optionalParams

...`unknown`[]

Optional parameters to log.

#### Returns

`void`

#### Implementation of

[`ILogger`](../../../declarations/interfaces/ILogger.md).[`error`](../../../declarations/interfaces/ILogger.md#error)

***

### info()

```ts
info(message, ...optionalParams): void;
```

Logs informational messages.

#### Parameters

##### message

`string`

The message to log.

##### optionalParams

...`unknown`[]

Optional parameters to log.

#### Returns

`void`

#### Implementation of

[`ILogger`](../../../declarations/interfaces/ILogger.md).[`info`](../../../declarations/interfaces/ILogger.md#info)

***

### log()?

```ts
optional log(message, ...optionalParams): void;
```

Logs general messages, similar to `info` but less specific.

#### Parameters

##### message

`string`

The message to log.

##### optionalParams

...`unknown`[]

Optional parameters to log.

#### Returns

`void`

#### Implementation of

[`ILogger`](../../../declarations/interfaces/ILogger.md).[`log`](../../../declarations/interfaces/ILogger.md#log)

***

### warn()

```ts
warn(message, ...optionalParams): void;
```

Logs warnings, used to indicate potential issues.

#### Parameters

##### message

`string`

The warning message to log.

##### optionalParams

...`unknown`[]

Optional parameters to log.

#### Returns

`void`

#### Implementation of

[`ILogger`](../../../declarations/interfaces/ILogger.md).[`warn`](../../../declarations/interfaces/ILogger.md#warn)

***

### create()

```ts
static create(options): ConsoleLogger;
```

Create a new ConsoleLogger instance.

#### Parameters

##### options

[`LoggerOptions`](../interfaces/LoggerOptions.md)

Options for creating the ConsoleLogger.

#### Returns

`ConsoleLogger`

- A new instance of ConsoleLogger.
