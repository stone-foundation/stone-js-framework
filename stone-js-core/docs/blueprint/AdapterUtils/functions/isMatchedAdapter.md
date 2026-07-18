# Function: isMatchedAdapter()

```ts
function isMatchedAdapter(
   blueprint, 
   platform?, 
   adapterAlias?): boolean;
```

Checks if the adapter matches the given alias or platform.

This function evaluates whether the provided adapter alias or platform
matches the current blueprint context. It returns true if either is empty,
or if they match the blueprint's registered values.

## Parameters

### blueprint

[`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md)

The blueprint to check against.

### platform?

`string`

The platform to match.

### adapterAlias?

`string`

The adapter alias to match.

## Returns

`boolean`

True if the adapter matches, false otherwise.
