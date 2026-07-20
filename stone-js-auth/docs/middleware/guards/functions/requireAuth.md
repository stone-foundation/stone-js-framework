[**Auth**](../../../README.md)

***

[Auth](../../../README.md) / [middleware/guards](../README.md) / requireAuth

# Function: requireAuth()

> **requireAuth**(): `FunctionalMiddleware`\<`IncomingEvent`, `OutgoingResponse`\>

Route guard requiring an authenticated request (a verified token).

## Returns

`FunctionalMiddleware`\<`IncomingEvent`, `OutgoingResponse`\>

A functional middleware that throws `AuthenticationError` (401) when anonymous.
