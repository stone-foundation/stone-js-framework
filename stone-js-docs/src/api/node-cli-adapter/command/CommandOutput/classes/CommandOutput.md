# Class: CommandOutput

Class representing a CommandOutput Facade.
Provides utility methods for logging, colored outputs, spinners, and progress bars.

## Properties

### format

```ts
readonly format: ChalkInstance;
```

A formatting library (e.g., `chalk`).

## Methods

### breakLine()

```ts
breakLine(value): this;
```

Output a line break.

#### Parameters

##### value

`number`

The number of newlines to add.

#### Returns

`this`

The current instance for chaining.

***

### error()

```ts
error(value, color): this;
```

Output error-colored text.

#### Parameters

##### value

`string`

The text to display.

##### color

`boolean` = `true`

Whether to color the text. Defaults to true.

#### Returns

`this`

The current instance for chaining.

***

### info()

```ts
info(value, color): this;
```

Output info-colored text.

#### Parameters

##### value

`string`

The text to display.

##### color

`boolean` = `true`

Whether to color the text. Defaults to true.

#### Returns

`this`

The current instance for chaining.

***

### progressBar()

```ts
progressBar(tokens, options): ProgressBar;
```

Create a progress bar.

#### Parameters

##### tokens

`string`

The template string for the progress bar.

##### options

`ProgressBarOptions`

Configuration options for the progress bar.

#### Returns

`ProgressBar`

A new ProgressBar instance.

***

### show()

```ts
show(value): this;
```

Output uncolored text.

#### Parameters

##### value

`string`

The text to display.

#### Returns

`this`

The current instance for chaining.

***

### spin()

```ts
spin(value): Ora;
```

Output a spinner.

#### Parameters

##### value

`string`

The spinner's initial message. Defaults to null.

#### Returns

`Ora`

The spinner instance started.

***

### spinner()

```ts
spinner(value): Ora;
```

Creates a spinner instance.

#### Parameters

##### value

`string`

The spinner's initial message. Defaults to null.

#### Returns

`Ora`

The spinner instance.

***

### succeed()

```ts
succeed(value, color): this;
```

Output success-colored text.

#### Parameters

##### value

`string`

The text to display.

##### color

`boolean` = `true`

Whether to color the text. Defaults to true.

#### Returns

`this`

The current instance for chaining.

***

### table()

```ts
table(value, properties?): this;
```

Output a table.

#### Parameters

##### value

`unknown`

The value to display as a table.

##### properties?

readonly `string`[]

#### Returns

`this`

The current instance for chaining.

***

### warn()

```ts
warn(value, color): this;
```

Output warn-colored text.

#### Parameters

##### value

`string`

The text to display.

##### color

`boolean` = `true`

Whether to color the text. Defaults to true.

#### Returns

`this`

The current instance for chaining.

***

### create()

```ts
static create(options): CommandOutput;
```

Create a CommandOutput instance.

#### Parameters

##### options

[`CommandOutputOptions`](../interfaces/CommandOutputOptions.md)

The options for creating the CommandOutput instance.

#### Returns

`CommandOutput`
