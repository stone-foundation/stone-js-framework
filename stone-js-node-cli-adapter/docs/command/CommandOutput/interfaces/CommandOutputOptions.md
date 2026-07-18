# Interface: CommandOutputOptions

CommandOutputOptions

## Properties

### format

```ts
format: ChalkInstance;
```

***

### smartConsole

```ts
smartConsole: (options?) => Ora;
```

Elegant terminal spinner.

#### Parameters

##### options?

`string` \| `Options`

If a string is provided, it is treated as a shortcut for `options.text`.

#### Returns

`Ora`

#### Example

```
import ora from 'ora';

const spinner = ora('Loading unicorns').start();

setTimeout(() => {
	spinner.color = 'yellow';
	spinner.text = 'Loading rainbows';
}, 1000);
```

***

### stdConsole

```ts
stdConsole: Console;
```
