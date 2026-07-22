[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [introspection](../README.md) / sanitize

# Function: sanitize()

> **sanitize**(`value`, `depth?`): `unknown`

Produce a JSON-safe, secret-redacted copy of a config value: functions/classes become a label,
`RegExp` its source, secret-looking keys `[redacted]`, and recursion is depth-capped.

## Parameters

### value

`unknown`

The value to sanitize.

### depth?

`number` = `0`

The current recursion depth.

## Returns

`unknown`

A serializable value.
