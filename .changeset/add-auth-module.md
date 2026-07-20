---
"@stone-js/auth": minor
---

Add `@stone-js/auth`: framework-agnostic, edge-native authentication built on `jose`. Stateless JWT/OAuth (access/id/refresh) — sign and verify on Node, browser, Deno, Bun and the edge, with a shared secret (HMAC), asymmetric keys (RS/ES/PS) or remote JWKS (OAuth/OIDC), plus issuer/audience/scope checks. Ships the `Authenticator` service, an `AuthenticateMiddleware` (populates `event.getUser()` from the Bearer token), `requireAuth()` / `requireScopes()` route guards, `authBlueprint` and `AuthServiceProvider`.
