---
"@stone-js/resources": patch
"@stone-js/i18n": patch
---

fix: a resource can type who is asking, and a translation module says when it has nothing

**The type parameters on `ResourceContext` were unusable, and my advice about them was wrong.** Two TypeScript rules met: a property-typed function is contravariant on its parameters, so narrowing the context in a subclass was rejected (`TS2416`), and TypeScript separately refuses a method where the base declared a property, so writing `async data (model, context) {}` was rejected too (`TS2425`) even though that is the form every example uses. Method bivariance, which I pointed at, applies to methods and `data` was not one.

So `Resource` and `IResource` now carry `EventType` and `PrincipalType` (`unknown` by default), and the two optional hooks are declared as methods on an interface merged with the class. A resource types who is asking:

```ts
class AccountResource extends Resource<Account, ResourceOutput, IncomingHttpEvent, Actor> {
  async data (account: Account, context: ResourceContext<IncomingHttpEvent, Actor>) {
    return { ...account, actorId: context.principal?.actorId }   // typed, no cast
  }
}
```

Both forms compile, with `strictFunctionTypes` and `exactOptionalPropertyTypes` on, and a type-level check runs with the tests so it stays that way.

**A translation module with no catalogs now says so.** It never failed: `t('SOME_KEY')` answered `SOME_KEY`, which reads like a missing entry rather than a missing module, passed every in-process test, passed the build, and reached production in the user's language. The build reports what the scan found (`i18n: 2 catalog(s), 2 locale(s) (en, fr)`) or that it found none, and the runtime warns at boot when nothing was registered, naming the three things that cause it.
