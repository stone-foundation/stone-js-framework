[**Validation**](../../../README.md)

***

[Validation](../../../README.md) / [middleware/validate](../README.md) / validate

# Function: validate()

> **validate**(`rules`): `FunctionalMiddleware`\<`IncomingEvent`, `OutgoingResponse`\>

Builds a route middleware that validates the event's inputs before the handler runs.

Attach it to any route's `middleware` — declarative
(`@Post('/users', { middleware: [validate({ name: NameSchema })] })`) or imperative
(route definition `middleware: [validate({ ... })]`). On failure it throws a
`ValidationError` (map it to `422` + problem+json in your HTTP error handler); on success the
handler runs untouched. The same schema works on the frontend via the `Validator` service —
one schema, both sides.

## Parameters

### rules

[`ValidationRules`](../../../validateEvent/type-aliases/ValidationRules.md)

The validation rules (event key → schema).

## Returns

`FunctionalMiddleware`\<`IncomingEvent`, `OutgoingResponse`\>

A functional middleware.
