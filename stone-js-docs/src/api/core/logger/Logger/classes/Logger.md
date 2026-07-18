# Class: Logger

Class representing a Logger for the Stone.js framework.

Any class that implements the ILogger interface can be used as a logger.
The Logger class provides static methods for logging messages at different levels (info, debug, warn, error).

## Constructors

### Constructor

```ts
new Logger(): Logger;
```

#### Returns

`Logger`

## Methods

### debug()

```ts
static debug(message, ...optionalParams): void;
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

***

### error()

```ts
static error(message, ...optionalParams): void;
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

***

### getInstance()

```ts
static getInstance(): ILogger;
```

Returns the current logger instance.

#### Returns

[`ILogger`](../../../declarations/interfaces/ILogger.md)

- The current logger instance.

***

### info()

```ts
static info(message, ...optionalParams): void;
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

***

### init()

```ts
static init(blueprint): void;
```

Initializes the logger instance.

#### Parameters

##### blueprint

[`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md)

The blueprint to initialize the logger with.

#### Returns

`void`

***

### log()

```ts
static log(message, ...optionalParams): void;
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

***

### warn()

```ts
static warn(message, ...optionalParams): void;
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
