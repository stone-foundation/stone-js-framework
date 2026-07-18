# Class: CliError

Represents an error specific to the Stone CLI.

Extends `RuntimeError` to provide a custom error type for handling CLI-related issues.

## Extends

- `RuntimeError`

## Constructors

### Constructor

```ts
new CliError(message, options?): CliError;
```

Creates a new instance of `CliError`.

#### Parameters

##### message

`string`

The error message describing the issue.

##### options?

`ErrorOptions`

Optional additional error options.

#### Returns

`CliError`

#### Overrides

```ts
RuntimeError.constructor
```
