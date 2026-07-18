# Class: StoneReporter

A branded reporter wrapping a CommandOutput.

## Constructors

### Constructor

```ts
new StoneReporter(output, version?): StoneReporter;
```

Create a StoneReporter.

#### Parameters

##### output

`CommandOutput`

The command output to delegate to.

##### version?

`string` = `'0.0.0'`

The version shown in the banner.

#### Returns

`StoneReporter`

## Methods

### banner()

```ts
banner(subtitle?): this;
```

Print the signature banner.

#### Parameters

##### subtitle?

`string`

An optional subtitle.

#### Returns

`this`

***

### changed()

```ts
changed(file, count?): this;
```

Print a "file changed" line for a live-reload rebuild (distinct from a first launch).

#### Parameters

##### file

`string`

The path of the file that changed.

##### count?

`number` = `0`

Optional change count for the same file (shown as `(x2)`).

#### Returns

`this`

***

### error()

```ts
error(message): this;
```

Print an error line.

#### Parameters

##### message

`string`

The message.

#### Returns

`this`

***

### hint()

```ts
hint(message): this;
```

Print a dim hint line (secondary guidance, e.g. "press Ctrl+C to stop").

#### Parameters

##### message

`string`

The hint message.

#### Returns

`this`

***

### info()

```ts
info(message): this;
```

Print an informational line.

#### Parameters

##### message

`string`

The message.

#### Returns

`this`

***

### spin()

```ts
spin(message): Ora;
```

Start a spinner (delegates to the underlying output).

#### Parameters

##### message

`string`

The spinner message.

#### Returns

`Ora`

***

### step()

```ts
step(message): this;
```

Print a timestamped step line (`◆ [stone] message`).

#### Parameters

##### message

`string`

The step message.

#### Returns

`this`

***

### success()

```ts
success(message, elapsedMs?): this;
```

Print a success line, optionally with elapsed time.

#### Parameters

##### message

`string`

The success message.

##### elapsedMs?

`number`

Optional elapsed time in ms.

#### Returns

`this`

***

### summary()

```ts
summary(rows): this;
```

Print an aligned key/value summary.

#### Parameters

##### rows

\[`string`, `string`\][]

Label/value pairs.

#### Returns

`this`

***

### warn()

```ts
warn(message): this;
```

Print a warning line.

#### Parameters

##### message

`string`

The message.

#### Returns

`this`

***

### create()

```ts
static create(output, version?): StoneReporter;
```

Create a StoneReporter.

#### Parameters

##### output

`CommandOutput`

The command output to delegate to.

##### version?

`string` = `'0.0.0'`

The version shown in the banner.

#### Returns

`StoneReporter`

A new StoneReporter.
