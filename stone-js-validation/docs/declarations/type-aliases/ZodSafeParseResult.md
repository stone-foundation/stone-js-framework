[**Validation**](../../README.md)

***

[Validation](../../README.md) / [declarations](../README.md) / ZodSafeParseResult

# Type Alias: ZodSafeParseResult\<T\>

> **ZodSafeParseResult**\<`T`\> = \{ `data`: `T`; `success`: `true`; \} \| \{ `error`: \{ `issues`: `ReadonlyArray`\<\{ `code?`: `string`; `message`: `string`; `path`: readonly `PropertyKey`[]; \}\>; \}; `success`: `false`; \}

A Zod-style `safeParse` result.

## Type Parameters

### T

`T`
