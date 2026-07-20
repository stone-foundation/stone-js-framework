[**Validation**](../../../README.md)

***

[Validation](../../../README.md) / [errors/ValidationError](../README.md) / ValidationErrorOptions

# Interface: ValidationErrorOptions

Options for a [ValidationError](../classes/ValidationError.md).

## Extends

- `ErrorOptions`

## Properties

### cause?

> `optional` **cause?**: `Error`

The original error that caused this error, useful for error chaining.

#### Inherited from

`ErrorOptions.cause`

***

### code?

> `optional` **code?**: `string`

A specific error code for identifying the error.

#### Inherited from

`ErrorOptions.code`

***

### issues

> **issues**: [`ValidationIssue`](../../../declarations/interfaces/ValidationIssue.md)[]

The normalised validation issues.

***

### metadata?

> `optional` **metadata?**: `unknown`

Additional information or context about the error.

#### Inherited from

`ErrorOptions.metadata`
