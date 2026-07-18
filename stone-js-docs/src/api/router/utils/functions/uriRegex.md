# Function: uriRegex()

```ts
function uriRegex(options, flags): RegExp;
```

Builds a regular expression for matching a full URI based on route options.

## Parameters

### options

[`RegexPatternOptions`](../../declarations/interfaces/RegexPatternOptions.md)

The route options to build the regex from.

### flags

`string` = `'i'`

Regular expression flags, defaults to 'i' (case insensitive).

## Returns

`RegExp`

A regular expression for matching URIs.

## Example

```typescript
const regex = uriRegex({ path: '/users/:id', strict: false });
console.log(regex.test('/users/123')); // true
```
