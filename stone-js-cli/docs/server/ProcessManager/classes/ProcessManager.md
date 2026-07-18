# Class: ProcessManager

Supervises a single long-running child process for the dev server.

A naive `kill(); spawn()` restart races on the listening port (the old process has not yet
released it → intermittent `EADDRINUSE`). This manager makes restarts deterministic: it
sends `SIGTERM`, **waits for the child's `exit` event** (force-killing with `SIGKILL` after a
timeout), and only then spawns the replacement. It also owns a single set of `SIGINT`/
`SIGTERM` handlers so `Ctrl+C` always tears the child down instead of leaving an orphan.

## Constructors

### Constructor

```ts
new ProcessManager(options): ProcessManager;
```

Create a ProcessManager.

#### Parameters

##### options

[`ProcessManagerOptions`](../interfaces/ProcessManagerOptions.md)

The supervisor options.

#### Returns

`ProcessManager`

## Accessors

### running

#### Get Signature

```ts
get running(): boolean;
```

Whether a child is currently running.

##### Returns

`boolean`

## Methods

### restart()

```ts
restart(): Promise<void>;
```

Restart the child: terminate the current one, wait for it to actually exit (so the port is
released), then spawn a fresh one. No-op once stopped.

#### Returns

`Promise`\<`void`\>

***

### start()

```ts
start(): void;
```

Start the child process (first launch). No-op once stopped.

#### Returns

`void`

***

### stop()

```ts
stop(): Promise<void>;
```

Stop the supervisor permanently and terminate the child.

#### Returns

`Promise`\<`void`\>

***

### create()

```ts
static create(options): ProcessManager;
```

Create a ProcessManager.

#### Parameters

##### options

[`ProcessManagerOptions`](../interfaces/ProcessManagerOptions.md)

The supervisor options.

#### Returns

`ProcessManager`

A new ProcessManager.
