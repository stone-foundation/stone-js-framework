[**Auth**](../../../README.md)

***

[Auth](../../../README.md) / [middleware/guards](../README.md) / requireScopes

# Function: requireScopes()

> **requireScopes**(...`required`): `FunctionalMiddleware`\<`IncomingEvent`, `OutgoingResponse`\>

Route guard requiring the authenticated principal to hold every given OAuth scope.

## Parameters

### required

...`string`[]

The required scopes.

## Returns

`FunctionalMiddleware`\<`IncomingEvent`, `OutgoingResponse`\>

A functional middleware that throws `AuthenticationError` (401) when anonymous or
         `AuthorizationError` (403) when a scope is missing.
