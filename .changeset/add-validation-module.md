---
"@stone-js/validation": minor
---

Add `@stone-js/validation`: framework-agnostic input validation. Define a schema once (Zod, Valibot, ArkType — anything Standard Schema) and validate it identically on the backend (route `validate({...})` middleware) and the frontend (the `Validator` service). Ships an engine-agnostic schema contract, Zod + Standard Schema adapters, a `Validator` service, a `ValidationError` carrying normalised issues, and an opt-in `validationBlueprint`.
