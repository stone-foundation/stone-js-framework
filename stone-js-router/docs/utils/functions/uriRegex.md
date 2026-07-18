# Function: uriRegex()

```ts
function uriRegex(options, flags?): RegExp;
```

Builds a regular expression for matching a full URI based on route options.

The URI regex covers the (optional) domain followed by the path and is the one
used to **extract** parameter values (see `Route.bind`). Every parameter is
emitted as a uniquely named capture group (`p0`, `p1`, ...) in constraint order,
so parameter binding is done by name and is immune to extra capture groups that
a user-supplied rule might introduce.

## Parameters

### options

[`RegexPatternOptions`](../../declarations/interfaces/RegexPatternOptions.md)

The route options to build the regex from.

### flags?

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
