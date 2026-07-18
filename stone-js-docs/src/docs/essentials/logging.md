---
title: Logging
next: ../router/
---

Logging is effortless and extensible in Stone.js.

At its core, Stone.js provides a built-in logging utility through a console-based singleton logger. This default logger is designed for simplicity, it's available globally, context-aware, and ready to use without configuration.

But that's just the beginning.

The logger system in Stone.js is fully integrated into the Continuum Architecture, meaning it works seamlessly across all dimensions: setup, initialization, and integration. You can access it from lifecycle hooks, middleware, event handlers, services and so on. The default implementation is perfect for development and prototyping, but when you need more power, you can replace it entirely with your own logger (like [pino](https://getpino.io/#/) or [winston](https://github.com/winstonjs/winston)).

Stone.js treats logging like any other part of your internal context: injectable, configurable, and replaceable.

Logging is not just for debugging, it's a first-class citizen in the Stone.js ecosystem. Whether you're building a CLI tool, a backend microservice, or a frontend app, the logger is always there, fluent with your context.

## Using Logger

### Access the Logger

Stone.js gives you multiple ways to access the logger, depending on the context you're in. The default logger is available as a singleton, but it’s also automatically injected into the system's internal context during setup, so no need for global imports, you can just inject it where you need it.

#### Global Singleton (Anywhere)

The simplest way to log from anywhere in your code is by using the singleton instance:

```ts
import { Logger } from '@stone-js/core';

export const myEventHandler = (event) => {
  Logger.info('Received event!', event);
};
```

Use this approach when you're not inside an injected context like a function-based service, middleware, or lifecycle hook. 
But avoid it in constructors if you can inject `logger` properly.

#### Contextual Injection (Preferred)
In most cases, you should inject the logger into your modules. This is the preferred way to access the logger, as it keeps your code clean and testable.

::: tabs#class-factory-function
@tab:active Class-based
##### Class-based

For class-based modules, like services or event handlers, the logger is injected into the constructor:

```ts
import { Service, ILogger } from '@stone-js/core';

@Service({ alias: 'MyService' })
export class MyService {
  private readonly logger: ILogger;

  constructor({ logger }: { logger: ILogger }) {
    this.logger = logger;
  }

  doSomething() {
    this.logger.info('Service method executed');
  }
}
```

**Tip**: Avoid accessing the global `Logger` singleton in constructors, always prefer injection. This keeps your code clean, testable, and aligned with the Continuum.

@tab Factory-based
##### Factory-based

For factory-based modules, like a middleware, the logger can be accessed through the `context` parameter:

```ts
export const MyBlueprintMiddleware = ({ logger }) => {
  return (context, next) => {
    logger.info('Blueprint middleware triggered')
    return next(context)
  }
}
```
:::

### Logger API

The logger in Stone.js follows a minimal and strict contract, defined by the `ILogger` interface. Whether you're using the built-in logger or your own, the same interface applies.

The default implementation is `ConsoleLogger`, which internally uses the native `console` methods and respects your blueprint configuration.

#### ILogger Interface

The interface defines the following methods:

```ts
export interface ILogger {
  info(message: string, ...optionalParams: unknown[]): void
  debug(message: string, ...optionalParams: unknown[]): void
  warn(message: string, ...optionalParams: unknown[]): void
  error(message: string, ...optionalParams: unknown[]): void
  log?(message: string, ...optionalParams: unknown[]): void
  trace?(message: string, ...optionalParams: unknown[]): void
}
```

#### Default Implementation: ConsoleLogger

The built-in logger is implemented as `ConsoleLogger` and is used automatically unless you override it.

Internally, it:

- Filters messages based on the `stone.logger.level` set in the blueprint.
- Supports an optional timestamp prefix using `stone.logger.useTimestamp`.
- Can print colored output when supported via `stone.logger.useColors`.
- Automatically enables verbose logging when `stone.debug` is set to `true`.

Here’s a typical usage:

```ts
Logger.debug('This will only be shown if log level is debug or lower');
Logger.error('Something went wrong', { context: 'ServiceX' });
```

This logger is available immediately after the blueprint is initialized and is accessible from anywhere in your application.

The behavior is context-aware, meaning you don’t need to manually check log levels or environment conditions. Stone.js handles that based on your blueprint settings.

### Configuring the Logger

Stone.js uses the blueprint as the single source of truth for all logger configuration. You don’t need to hardcode log levels or timestamps, just define your preferences, and the logger will adapt automatically across your entire application.

#### Available Configuration Keys

You can set the following options in your blueprint:

```ts
blueprint.set('stone.logger.level', 'debug');     // Minimum log level
blueprint.set('stone.logger.useTimestamp', true); // Include timestamps in logs
blueprint.set('stone.logger.useColors', true); // Colored output (when supported)
blueprint.set('stone.debug', true);             // Force all logs, even in production
```

These options work together to determine whether and how logs are shown. For example:

- If `stone.logger.level` is set to `"warn"`, then only `warn()` and `error()` messages will be printed.
- If `stone.debug` is set to `true`, it overrides the level and prints everything regardless of the level setting.
- If `stone.logger.useTimestamp` is `true`, each message will be prefixed with the current ISO date.

#### Supported Log Levels

Stone.js uses the following enum for log levels:

```ts
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}
```

The default level is `"error"` if no level is specified.

#### Example

```ts
import { LogLevel } from '@stone-js/core';

blueprint.set('stone.logger.level', LogLevel.DEBUG);
blueprint.set('stone.logger.useTimestamp', true);
blueprint.set('stone.logger.useColors', true);
```

This setup ensures that your logs are verbose, readable, and timestamped, ideal for development or debugging sessions.

## Customizing the Logger

Stone.js is not opinionated about how you log, it simply defines an interface and lets you plug in whatever tool fits your needs. If the built-in `ConsoleLogger` doesn’t meet your requirements, you can replace it with your own implementation.

You might want to customize the logger if:

- You need file-based or remote logging (e.g. writing to disk, HTTP, Elasticsearch).
- You use an external logging system like `pino`, `winston`, or `bunyan`.
- You want to apply custom formatting, redaction, or metadata.

Stone.js allows you to create a logger using either a **class** or a **factory function**, as long as it implements the `ILogger` interface.

### Defining a Custom Logger

::: tabs#class-factory-function
@tab:active Class-based
#### Class-based Logger

This approach gives you full control and access to the blueprint.

```ts
import { ILogger } from '@stone-js/core';

export class MyCustomLogger implements ILogger {
  constructor(private readonly options: { blueprint }) {}

  info(message: string, ...params: unknown[]) {
    // custom info implementation
  }

  debug(message: string, ...params: unknown[]) {
    // custom debug implementation
  }

  warn(message: string, ...params: unknown[]) {
    // custom warn implementation
  }

  error(message: string, ...params: unknown[]) {
    // custom error implementation
  }
}
```

@tab Factory-based
#### Factory-based Logger

This is simpler and works well for wrapping third-party libraries.

```ts
import { ILogger } from '@stone-js/core';

export const MyCustomLogger = ({ blueprint }): ILogger => {
  return {
    info: (msg, ...params) => { /* custom info logic */ },
    debug: (msg, ...params) => { /* custom debug logic */ },
    warn: (msg, ...params) => { /* custom warn logic */ },
    error: (msg, ...params) => { /* custom error logic */ }
  };
};
```
:::

Both approaches give you access to the blueprint, so you can conditionally enable logs, pull log levels, or respect other system settings.

### Using a Custom Logger

Once your custom logger is defined, either as a class or a factory, you don’t need to change how you use logging in your application.  
Everything works the same: you can still access the logger via the global singleton or via dependency injection in lifecycle hooks, services, or middleware.

```ts
import { Logger } from '@stone-js/core';

export const myHandler = () => {
  Logger.info('Custom logger is now active');
};
```

Under the hood, the `Logger` singleton will delegate to your custom implementation.  
So once registered, all logging across your system will automatically route through your logger.

This makes it easy to swap in advanced loggers like Pino, Winston, or your in-house system without rewriting your application logic.

### Registering a Custom Logger

To register your custom logger, use the `defineLogger()` utility provided by Stone.js. This function tells the system which logger to use and how to instantiate it.

The `defineLogger` signature is:

```ts
defineLogger(
  logger: new (...args: any[]) => ILogger | (options: { blueprint: IBlueprint }) => ILogger,
  isFactory?: boolean,
  config?: Record<string, unknown>
)
```

- `logger`: your custom logger class or factory function.
- `isFactory`: `true` if it’s a factory, `false` if it’s a class.
- `config`: optional additional settings that will be injected into the blueprint before instantiating the logger.

::: tabs#class-factory-function
@tab:active Class-based
#### Class-based example

```ts
import { defineLogger } from '@stone-js/core';
import { MyCustomLogger } from './my-custom-logger';

blueprint.set(defineLogger(MyCustomLogger, false));
```

#### Registering with custom config

```ts
blueprint.set(defineLogger(MyCustomLogger, false, {
  'stone.logger.level': 'debug',
  'stone.logger.useTimestamp': true
}));
```

@tab Factory-based
#### Factory-based example

```ts
import { defineLogger } from '@stone-js/core';
import { MyCustomLogger } from './my-custom-logger';

blueprint.set(defineLogger(MyCustomLogger));
```

#### Registering with custom config

```ts
blueprint.set(defineLogger(MyCustomLogger, true, {
  'stone.logger.level': 'debug',
  'stone.logger.useTimestamp': true
}));
```
:::

This allows you to register your custom logger and inject any required configuration upfront, no extra boilerplate, just pure context-driven setup.

## Example: Using Pino with Stone.js

[Pino](https://getpino.io/#/) is a high-performance JSON logger, ideal for structured logging in production environments.

### Installation

```bash
npm install pino
```

### Factory-Based Implementation

```ts
// my-pino-logger.ts
import pino from 'pino';
import { ILogger } from '@stone-js/core';

export const MyPinoLogger = ({ blueprint }): ILogger => {
  const level = blueprint.get<string>('stone.logger.level', 'info');
  const useTimestamp = blueprint.get<boolean>('stone.logger.useTimestamp', false);

  const logger = pino({
    level,
    timestamp: useTimestamp ? pino.stdTimeFunctions.isoTime : false
  });

  return {
    info: (msg, ...params) => logger.info({ extra: params }, msg),
    debug: (msg, ...params) => logger.debug({ extra: params }, msg),
    warn: (msg, ...params) => logger.warn({ extra: params }, msg),
    error: (msg, ...params) => logger.error({ extra: params }, msg),
    trace: (msg, ...params) => logger.trace?.({ extra: params }, msg),
    log: (msg, ...params) => logger.info({ extra: params }, msg)
  };
};
```

### Registering the Factory-based Logger

```ts
import { defineLogger } from '@stone-js/core';
import { MyPinoLogger } from './my-pino-logger';

blueprint.set(defineLogger(MyPinoLogger, true, {
  'stone.logger.level': 'debug',
  'stone.logger.useTimestamp': true
}));
```

## Example: Using Winston with Stone.js

[Winston](https://github.com/winstonjs/winston) is a flexible logger with support for multiple transports (console, file, HTTP, etc).

### Installation

```bash
npm install winston
```

### Class-Based Implementation

```ts
// my-winston-logger.ts
import winston from 'winston';
import { ILogger, IBlueprint } from '@stone-js/core';

export class MyWinstonLogger implements ILogger {
  private readonly logger: winston.Logger;

  constructor({ blueprint }: { blueprint: IBlueprint }) {
    const level = blueprint.get<string>('stone.logger.level', 'info');
    const useTimestamp = blueprint.get<boolean>('stone.logger.useTimestamp', false);

    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        ...(useTimestamp
          ? [winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })]
          : []),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const base = useTimestamp ? `[${timestamp}]` : '';
          const extras = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${base} ${level.toUpperCase()}: ${message} ${extras}`;
        })
      ),
      transports: [new winston.transports.Console()]
    });
  }

  info(message: string, ...params: unknown[]): void {
    this.logger.info(message, { extra: params });
  }

  debug(message: string, ...params: unknown[]): void {
    this.logger.debug(message, { extra: params });
  }

  warn(message: string, ...params: unknown[]): void {
    this.logger.warn(message, { extra: params });
  }

  error(message: string, ...params: unknown[]): void {
    this.logger.error(message, { extra: params });
  }

  trace?(message: string, ...params: unknown[]): void {
    this.logger.verbose?.(message, { extra: params });
  }

  log?(message: string, ...params: unknown[]): void {
    this.logger.info(message, { extra: params });
  }
}
```

### Registering the Class-Based Logger

```ts
import { defineLogger } from '@stone-js/core';
import { MyWinstonLogger } from './my-winston-logger';

blueprint.set(defineLogger(MyWinstonLogger, false, {
  'stone.logger.level': 'debug',
  'stone.logger.useTimestamp': true
}));
```

These examples give you real-world logging power while staying fully compatible with Stone.js.

## Best Practices

Use these guidelines to ensure that logging in your Stone.js application remains clean, efficient, and maintainable:

#### Prefer dependency injection over global access

Always use the injected `logger` when you're inside:
- a lifecycle hook
- a blueprint middleware
- a service constructor

Avoid importing and using the `Logger` singleton in places where dependency injection is possible. This keeps your code decoupled and testable.

```ts
// ✅ Preferred
export class MyService {
  private readonly logger: ILogger;
  constructor({ logger }: { logger: ILogger }) {
    this.logger = logger;
  }

  doSomething() {
    this.logger.debug('Doing something');
  }
}

// 🚫 Avoid (hard to test and mock)
import { Logger } from '@stone-js/core';
Logger.info('Direct usage');
```

#### Centralize logging configuration

Use the blueprint to set all logger-related options. Avoid hardcoding log levels or formatting rules inside your code.

```ts
blueprint.set('stone.logger.level', 'info');
blueprint.set('stone.logger.useTimestamp', true);
```

This ensures consistency across environments and makes it easier to switch logging strategies later.

#### Be selective with verbosity

- Use `debug()` for developer-only insights.
- Use `info()` for general application state.
- Use `warn()` for unexpected but non-fatal conditions.
- Use `error()` only when something truly failed and should be investigated.
- Use `trace()` sparingly, it's meant for very fine-grained diagnostics.

Don’t log everything all the time, too much logging can hide real problems in a sea of noise.

#### Avoid logging sensitive data

Even though logs are meant for diagnostics, never log passwords, tokens, personal identifiers, or any confidential business logic. If needed, use redaction libraries or manual masking.

```ts
logger.info('User login', { username }); // ✅ okay
logger.info('Token:', token); // 🚫 avoid this
```

#### Customize your logger when needed

When you're ready to move beyond the console:
- Choose `pino` for speed and structured logs.
- Choose `winston` for flexibility and multiple output targets.
- Choose your own tool if it fits your ecosystem.

Stone.js makes swapping the logger easy, just implement the `ILogger` interface and register it via `defineLogger()`.

#### Keep log messages meaningful

Treat log messages like code comments. They should:
- Describe what happened
- Be human-readable
- Help future-you debug an issue

```ts
logger.info('User created', { userId }); // ✅
logger.debug('Something happened'); // 🚫 too vague
```

## Summary

Logging in Stone.js is simple, flexible, and built to scale with your application.

Out of the box, you get a lightweight, console-based logger that’s fully integrated into the framework. It’s available globally via a singleton and is automatically injected into your context where appropriate, services, middleware, lifecycle hooks, and more.

You can configure its behavior through the blueprint, adjusting verbosity, timestamp formatting, and debug mode. When you're ready to move beyond the basics, you can easily replace the logger with your own class or factory, whether that’s wrapping a library like Pino or Winston, or building a completely custom solution.

Stone.js doesn’t lock you into one way of doing things, it gives you a common interface, a clean contract, and the freedom to extend logging in a way that fits your needs.

**Quick recap:**
- Use the logger via `Logger` or inject it where available.
- Configure it with `stone.logger.level`, `useTimestamp`, and `stone.debug`.
- Implement `ILogger` if you want to customize.
- Register your logger using `defineLogger()`, class or factory, your choice.
- Log intentionally. Debug confidently. Deploy with traceability.

That's it, you're now fully equipped to tame your logs in the Continuum.
