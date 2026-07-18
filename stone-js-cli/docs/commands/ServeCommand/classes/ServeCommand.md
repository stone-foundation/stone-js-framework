# Class: ServeCommand

The serve command class.

Owns the dev-server lifecycle: it builds once, launches a supervised child process, and — for
backend apps — watches the sources to rebuild and restart on change. Console output is
context-aware: the first launch shows a banner + build spinner + "watching" hint, while a
live-reload cycle shows a concise "changed → rebuilt · restarted" line.

## Constructors

### Constructor

```ts
new ServeCommand(context): ServeCommand;
```

Create a new instance of ServeCommand.

#### Parameters

##### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

The service container to manage dependencies.

#### Returns

`ServeCommand`

## Methods

### handle()

```ts
handle(event): Promise<void>;
```

Handle the incoming event.

#### Parameters

##### event

`IncomingEvent`

The incoming event.

#### Returns

`Promise`\<`void`\>
