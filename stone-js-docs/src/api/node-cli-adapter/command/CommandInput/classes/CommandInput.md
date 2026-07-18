# Class: CommandInput

Class representing a CommandInput Facade.
Provides a simplified and consistent API for prompting users in the terminal
using the `prompts` library. Supports a variety of question types,
such as text, number, confirm, password, select, multiselect, and more.

## Methods

### ask()

```ts
ask(message, fallback?): Promise<string>;
```

Asks the user for a string input.

#### Parameters

##### message

`string`

The question to display to the user.

##### fallback?

`string`

An optional default value.

#### Returns

`Promise`\<`string`\>

The user's response as a string.

***

### askNumber()

```ts
askNumber(message, fallback?): Promise<number>;
```

Asks the user for a numeric input.

#### Parameters

##### message

`string`

The question to display to the user.

##### fallback?

`number`

An optional default numeric value.

#### Returns

`Promise`\<`number`\>

The user's response as a number.

***

### choice()

```ts
choice(
   message, 
   choices, 
   fallbackIndex, 
multiple): Promise<string | string[]>;
```

Asks the user to choose from a list of options.

#### Parameters

##### message

`string`

The message to display to the user.

##### choices

`Choice`[]

A list of string options to choose from.

##### fallbackIndex

`number`[] = `...`

An array of fallback selected indices (default is first).

##### multiple

`boolean` = `false`

Whether to allow multiple selections (checkbox style).

#### Returns

`Promise`\<`string` \| `string`[]\>

The user's selection(s) as a string or array of strings.

***

### confirm()

```ts
confirm(message, fallback): Promise<boolean>;
```

Asks the user for a yes/no confirmation.

#### Parameters

##### message

`string`

The confirmation message to show.

##### fallback

`boolean` = `false`

The default value if the user provides no response (defaults to false).

#### Returns

`Promise`\<`boolean`\>

The user's response as a boolean.

***

### editor()

```ts
editor(message, fallback?): Promise<string>;
```

Opens a pseudo-editor by asking the user to input a multi-line value in the terminal.
(Note: actual editor support is limited in `prompts`, so this simulates one via text input).

#### Parameters

##### message

`string`

The message to display to the user.

##### fallback?

`string`

An optional default value.

#### Returns

`Promise`\<`string`\>

The user's response as a string.

***

### prompt()

```ts
prompt<T>(question): Promise<T>;
```

Prompts the user with a single question and returns the response.

#### Type Parameters

##### T

`T`

#### Parameters

##### question

`Omit`\<`PromptObject`, `"name"`\>

A prompt object without a `name`, which will be set to 'value'.

#### Returns

`Promise`\<`T`\>

The user's input cast to the specified type.

***

### secret()

```ts
secret(message): Promise<string>;
```

Asks the user for a hidden (secret) input such as a password.

#### Parameters

##### message

`string`

The message to display to the user.

#### Returns

`Promise`\<`string`\>

The user's input as a string.

***

### create()

```ts
static create(options): CommandInput;
```

Factory method to create a new CommandInput instance.

#### Parameters

##### options

[`CommandInputOptions`](../interfaces/CommandInputOptions.md)

The options to configure the CommandInput instance.

#### Returns

`CommandInput`

A new instance of CommandInput.
