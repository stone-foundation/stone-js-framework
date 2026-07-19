[**Validation**](../../README.md)

***

[Validation](../../README.md) / [declarations](../README.md) / ValidationResult

# Type Alias: ValidationResult\<T\>

> **ValidationResult**\<`T`\> = \{ `issues?`: `undefined`; `success`: `true`; `value`: `T`; \} \| \{ `issues`: [`ValidationIssue`](../interfaces/ValidationIssue.md)[]; `success`: `false`; `value?`: `undefined`; \}

The outcome of validating a value against a schema. Never throws — inspect `success`.

## Type Parameters

### T

`T`
