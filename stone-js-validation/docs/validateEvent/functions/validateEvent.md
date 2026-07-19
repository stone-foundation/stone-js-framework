[**Validation**](../../README.md)

***

[Validation](../../README.md) / [validateEvent](../README.md) / validateEvent

# Function: validateEvent()

> **validateEvent**(`event`, `rules`, `validator?`): `void`

Validates several event inputs at once against their schemas.

For each `[key, schema]` it validates `event.get(key)` and collects every issue (each issue's
path is prefixed with its key). If any input fails, it throws a single [ValidationError](../../errors/ValidationError/classes/ValidationError.md)
carrying all the issues — so the caller sees the full picture, not just the first failure.

Platform-agnostic: the event only needs a `get(key)` method, so it works for HTTP, CLI, browser
or any other context.

## Parameters

### event

[`ReadableEvent`](../interfaces/ReadableEvent.md)

The incoming event (anything with `get`).

### rules

[`ValidationRules`](../type-aliases/ValidationRules.md)

The validation rules.

### validator?

[`IValidator`](../../declarations/interfaces/IValidator.md) = `...`

The validator to use (defaults to a fresh stateless one).

## Returns

`void`

## Throws

When any input fails validation.
