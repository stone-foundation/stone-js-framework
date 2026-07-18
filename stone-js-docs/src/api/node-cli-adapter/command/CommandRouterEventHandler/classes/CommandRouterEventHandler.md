# Class: CommandRouterEventHandler\<W, X\>

Class representing a CommandRouterEventHandler.
Responsible for finding and dispatching commands based on incoming events.

## Author

Mr. Stone <evensstone@gmail.com>

## Type Parameters

### W

`W` *extends* `IncomingEvent` = `IncomingEvent`

### X

`X` = `unknown`

## Implements

- `IEventHandler`\<`W`, `X`\>

## Constructors

### Constructor

```ts
new CommandRouterEventHandler<W, X>(container): CommandRouterEventHandler<W, X>;
```

Create a new instance of CommandRouter.

#### Parameters

##### container

[`CommandRouterEventHandlerOptions`](../interfaces/CommandRouterEventHandlerOptions.md)

The container instance for dependency resolution.

#### Returns

`CommandRouterEventHandler`\<`W`, `X`\>

## Methods

### dispatch()

```ts
dispatch(event): Promise<X>;
```

Dispatches an event to the appropriate command.

#### Parameters

##### event

`W`

The incoming event to be dispatched.

#### Returns

`Promise`\<`X`\>

The result of the command execution.

***

### findCommand()

```ts
findCommand(event): 
  | undefined
| ICommandHandler<W, X>;
```

Finds a command that matches the given event.

#### Parameters

##### event

`W`

The incoming event to match against commands.

#### Returns

  \| `undefined`
  \| [`ICommandHandler`](../../../declarations/interfaces/ICommandHandler.md)\<`W`, `X`\>

The matching command, or undefined if no match is found.

***

### handle()

```ts
handle(event): Promise<X>;
```

Handle an incoming event.

#### Parameters

##### event

`W`

The incoming event to process.

#### Returns

`Promise`\<`X`\>

The outgoing response.

#### Implementation of

```ts
IEventHandler.handle
```

***

### runCommand()

```ts
runCommand(event, command?): Promise<X>;
```

Runs the given command with the provided event.

#### Parameters

##### event

`W`

The event to handle.

##### command?

[`ICommandHandler`](../../../declarations/interfaces/ICommandHandler.md)\<`W`, `X`\>

The command to execute.

#### Returns

`Promise`\<`X`\>

The result of the command execution, or void if no command is found.

***

### create()

```ts
static create<W, X>(options): CommandRouterEventHandler<W, X>;
```

Creates a new instance of `CommandRouter`.

This static method initializes a `CommandRouter` with the specified options.

#### Type Parameters

##### W

`W` *extends* `IncomingEvent` = `IncomingEvent`

The type of the incoming event (default: `IncomingEvent`).

##### X

`X` *extends* `OutgoingResponse` = `OutgoingResponse`

The type of the outgoing response (default: `OutgoingResponse`).

#### Parameters

##### options

[`CommandRouterEventHandlerOptions`](../interfaces/CommandRouterEventHandlerOptions.md)

The configuration options for the `CommandRouter`.

#### Returns

`CommandRouterEventHandler`\<`W`, `X`\>

A new instance of `CommandRouter` configured with the provided options.
