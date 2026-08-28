---
"@stone-js/http-core": patch
"@stone-js/fetch-adapter": patch
"@stone-js/azure-functions-http-adapter": patch
"@stone-js/alibaba-fc-http-adapter": patch
---

refactor: one Web request normalizer, in the layer that owns HTTP

`@stone-js/fetch-adapter` and `@stone-js/azure-functions-http-adapter` each carried their own copy of the same hundred-line file for reading a Web request: lower-casing headers, picking the client address out of a forwarding chain, deciding whether a body can become a string, and reading that single-shot body once. The two copies differed by nine lines, all of them in one list: the order of the headers that platform's edge writes the client address into.

That list is the only part that is genuinely per-platform, so it is now an argument rather than a constant, and the reader itself lives once in `@stone-js/http-core` as `normalizeWebRequest(request, ipHeaders)`. It is runtime-agnostic by construction: `Request`, `Headers` and `URL` exist in Node, in a browser and at the edge, and it touches nothing else. It types against a duck shape rather than the nominal `Request` class, because a platform's own request class is Web-shaped without being that exact type, and typing against the class is what forced the second copy in the first place.

Six symbols consequently stop being exported by those two adapters: `NormalizedRequest`, `headersToRecord`, `resolveIp`, `isTextualContentType`, `readRawBody` and `normalizeRequest`. They were implementation details of an adapter that had no reason to publish them, and their replacements are exported from `@stone-js/http-core`. Each adapter now publishes only its `IP_HEADERS`, which is the one thing it actually knows.

`@stone-js/alibaba-fc-http-adapter` keeps its own reader, deliberately. Alibaba FC hands the handler a plain object, not a request: its headers are a record of strings or arrays and its body is already a `Buffer`, so there is no Web request there to normalise. It takes from `http-core` what is genuinely shared, the normalized shape and the header-level predicates, and keeps the part that is FC's own. Reuse follows what the platform hands over, not what the file is named.

Removing the copies also removed the coverage they contributed, which uncovered two things worth more than the deduplication. Neither adapter had a single test that carried a request through its own middleware: every test asserted one piece in isolation, so the path from the platform handler to the answer had never been executed once, and a mis-wired normalizer would have passed. Both now have that test, a real request in and a real answer out. And both error-path tests were quietly proving nothing: they caught the rejection and accepted either outcome, and they set `stone.adapter.errorHandlers` while the kernel reads `stone.adapter.errorHandlers.default`, so the error handler was never reached. Both now assert that the adapter answers instead of throwing, and that the handler was consulted.
