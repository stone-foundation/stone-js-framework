# Interface: LoggerConfig

**LoggerConfig Interface**

Represents the base configuration options for an `ILogger` instance.
This allows customization of logging behavior, including log level,
output styling, and the logger resolver.

## Properties

### level?

```ts
optional level: LogLevel;
```

The log level for the logger.

Defines the minimum level of log messages that should be logged.
Common values include:
- `'error'`: Errors that need immediate attention
- `'warn'`: Warnings
- `'info'`: Informational messages
- `'debug'`: Debug information
- `'trace'`: Fine-grained debug information

#### Default

`'error'`

***

### resolver?

```ts
optional resolver: LoggerResolver;
```

A resolver function that returns a logger instance.

Allows you to customize the logger used by the application.
This function provides a way to inject a logger that suits specific requirements.

#### Default

`defaultLoggerResolver`

***

### useColors?

```ts
optional useColors: boolean;
```

Whether to enable color output in the logs.

Useful for improving log readability, especially in terminal environments
or when using third-party loggers such as Pino.

#### Default

`false`

***

### useTimestamp?

```ts
optional useTimestamp: boolean;
```

Defines whether to include a timestamp in log messages.

Adding timestamps helps in tracking when each log event occurred.

#### Default

`false`
