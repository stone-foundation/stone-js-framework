# Function: pathRegex()

```ts
function pathRegex(options, flags): RegExp;
```

Builds a regular expression for matching route paths based on route options.

## Parameters

### options

[`RegexPatternOptions`](../../declarations/interfaces/RegexPatternOptions.md)

The route options to build the regex from.

### flags

`string` = `'i'`

Regular expression flags, defaults to 'i' (case insensitive).

## Returns

`RegExp`

A regular expression for matching route paths.

## Example

```typescript
const regex = pathRegex({ path: '/users/:id', strict: false });
console.log(regex.test('/users/123')); // true
```
