---
'@stone-js/resources': minor
'@stone-js/openapi': minor
---

Resources stand alone, and a contract is derived from everything a route declares.

**Resources no longer depend on a validation module.** Exposing data required enabling
`@stone-js/validation` and throwing without it — coupling with nothing to show for it. The module now
carries its own `ContractChecker`, which reads *specifications* rather than one library's API:
Standard Schema first (Zod, Valibot, ArkType and others), then `safeParse`, `parse` or `validate`.
Pass your own `checker` to teach it another dialect. A schema it cannot run raises rather than
reporting success, and an asynchronous schema says so instead of serialising a promise.

**The route option is `contract`, not `openapi`.** A route describes itself; OpenAPI is one way of
rendering that description, and naming the option after a specification put that specification's name
in the router's vocabulary. `contract: { summary }` states what the derivation cannot know, and
`contract: false` keeps an endpoint out of the document.

**Everything a route declares is now discovered, wherever it was written.** The document reads the
route option *and* the handler's own decorator — `@Validate`, `@Returns`, `@Protect`, `@Can` — for all
four concerns. Both modules advertise working without a router, and a contract that only read route
options documented half of such an application: endpoints listed, payloads missing. The keys are read
as strings, so `@stone-js/openapi` still depends on none of those packages.

**A named resource is documented.** Neither call site passed the resource registry, so
`{ resource: 'task' }` — the recommended style — produced no documented response while an inline
resource did. Both now hand over `stone.resources.registry`.

**Fragments are part of the contract, not prose.** They were named in a description, invisible to a
generated client, a form or a test. They are now an enumerated query parameter, under the name the
application actually answers to (`stone.resources.params.fragment`), so a document never advertises a
parameter the app does not have.

**A declaration that could not be read is reported.** Omitting a contract we cannot build stays the
rule — a wrong contract is worse than a missing one — but silence meant an endpoint shipped
undocumented inside a document that looked complete. `stone openapi` prints one line per skipped
declaration, naming the route and the reason, and the served handler logs the same.
