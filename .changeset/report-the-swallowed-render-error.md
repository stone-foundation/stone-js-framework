---
"@stone-js/use-react-core": patch
---

fix(use-react-core): a failing page says so, instead of failing quietly

When a page threw, the framework rendered its error page and told nobody. The response looked
successful: a status the handler chose, well-formed HTML, an application still serving. The only
trace left anywhere was `{"name":"TypeError"}` in the hydration snapshot, and a message-less
`TypeError` on a path that never mentions the thing that threw is close to undiagnosable.

That is not hypothetical. It is exactly how the compression bug in `@stone-js/http-core` hid: hours
of bisecting a page element by element, and the answer only appeared after temporarily patching a
built package to print what it was discarding.

**The error is now logged where it is swallowed**, with its stack, which reads as name, message and
frames. Logged rather than rethrown, because the response is legitimate: the point is to be told, not
to turn a handled error into an unhandled one. A container that cannot resolve a logger does not fail
the response either.

**The snapshot carries the message only when the application asked to be debugged.** It is serialized
into the page and sent to the browser, and a message can name a file, a query or a column, none of
which is a client's business. With `debug: true` the message is there, which is what a developer
opening devtools wants; without it, a name, as before.
