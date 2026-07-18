# Function: domainRegex()

```ts
function domainRegex(options, flags): undefined | RegExp;
```

Builds a regular expression for matching domains based on route options.

## Parameters

### options

[`RegexPatternOptions`](../../declarations/interfaces/RegexPatternOptions.md)

The route options to build the regex from.

### flags

`string` = `'i'`

Regular expression flags, defaults to 'i' (case insensitive).

## Returns

`undefined` \| `RegExp`

A regular expression for matching domains or undefined if no domain is specified.

## Example

```typescript
const regex = domainRegex({ domain: '{subdomain}.example.com' });
console.log(regex?.test('api.example.com')); // true
```
