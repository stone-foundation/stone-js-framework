# Function: resolveMethodOverride()

```ts
function resolveMethodOverride(
   blueprint, 
   rawEvent, 
   bodyOverride?): string | undefined;
```

Resolve a safe HTTP method override for fullstack forms.

HTML forms can only send GET/POST, so frameworks let a POST declare its "real" method via a
hidden `$method$` field or the standard `X-HTTP-Method-Override` header. Accepting that override
UNCONDITIONALLY (as the code used to) is a security hole: any request could turn itself into a
DELETE and bypass method-based access/CSRF checks.

This gates the override so it is only honoured when ALL hold:
- it is explicitly enabled (`stone.http.allowMethodOverride`, default true), and
- the ORIGINAL method is `POST` (never upgrade a GET), and
- the target is a safe, whitelisted method (`PUT`/`PATCH`/`DELETE`).

The standard `X-HTTP-Method-Override` header takes precedence over the `$method$` body field.

## Parameters

### blueprint

`IBlueprint`

The application blueprint.

### rawEvent

`IncomingMessage`

The incoming Node request.

### bodyOverride?

`unknown`

The `$method$` value extracted from the parsed body/form (if any).

## Returns

`string` \| `undefined`

The overridden method (upper-case), or undefined to keep the original method.
