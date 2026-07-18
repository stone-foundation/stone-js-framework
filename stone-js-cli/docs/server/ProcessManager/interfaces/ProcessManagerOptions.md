# Interface: ProcessManagerOptions

Options for a [ProcessManager](../classes/ProcessManager.md).

## Properties

### args

```ts
args: string[];
```

The command arguments.

***

### command

```ts
command: string;
```

The command to run (e.g. `'node'`).

***

### killTimeout?

```ts
optional killTimeout?: number;
```

Milliseconds to wait for a graceful exit before force-killing. Default 5000.

***

### onExit?

```ts
optional onExit?: (code) => void;
```

Called when the supervised child exits on its own (not during a managed restart/stop).

#### Parameters

##### code

`number` \| `null`

#### Returns

`void`
