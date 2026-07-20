[**Validation**](../../README.md)

***

[Validation](../../README.md) / [declarations](../README.md) / ValidationIssue

# Interface: ValidationIssue

A single validation problem, normalised across engines.

## Properties

### code?

> `optional` **code?**: `string`

Optional engine/rule code (e.g. `too_small`).

***

### message

> **message**: `string`

Human-readable message.

***

### path

> **path**: (`string` \| `number`)[]

Property path to the offending value (e.g. `['user', 'email']`).
