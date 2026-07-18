# Function: setupProcessSignalHandlers()

```ts
function setupProcessSignalHandlers(getServerProcess): void;
```

Setup process signal handlers that terminate the current child process on shutdown.

Accepts a **getter** rather than a process value: the child is usually spawned after this is
wired (in a command constructor), so capturing the value here would capture `undefined` and
never kill the real child (leaving orphaned servers on Ctrl+C). The getter is read at signal
time, so it always sees the current child.

## Parameters

### getServerProcess

() => `ChildProcess` \| `undefined`

Returns the child process to terminate (or undefined if none yet).

## Returns

`void`
