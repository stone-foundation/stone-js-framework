# @stone-js/fetch-adapter

## 0.8.19

### Patch Changes

- Updated dependencies [6b76c36]
- Updated dependencies [cb52a51]
- Updated dependencies [865579c]
  - @stone-js/core@0.8.19
  - @stone-js/http-core@0.8.19
  - @stone-js/filesystem@0.8.19
  - @stone-js/config@0.8.19

## 0.8.18

### Patch Changes

- 9ba6f7b: refactor: one Web request normalizer, in the layer that owns HTTP

  `@stone-js/fetch-adapter` and `@stone-js/azure-functions-http-adapter` each carried their own copy of the same hundred-line file for reading a Web request: lower-casing headers, picking the client address out of a forwarding chain, deciding whether a body can become a string, and reading that single-shot body once. The two copies differed by nine lines, all of them in one list: the order of the headers that platform's edge writes the client address into.

  That list is the only part that is genuinely per-platform, so it is now an argument rather than a constant, and the reader itself lives once in `@stone-js/http-core` as `normalizeWebRequest(request, ipHeaders)`. It is runtime-agnostic by construction: `Request`, `Headers` and `URL` exist in Node, in a browser and at the edge, and it touches nothing else. It types against a duck shape rather than the nominal `Request` class, because a platform's own request class is Web-shaped without being that exact type, and typing against the class is what forced the second copy in the first place.

  Six symbols consequently stop being exported by those two adapters: `NormalizedRequest`, `headersToRecord`, `resolveIp`, `isTextualContentType`, `readRawBody` and `normalizeRequest`. They were implementation details of an adapter that had no reason to publish them, and their replacements are exported from `@stone-js/http-core`. Each adapter now publishes only its `IP_HEADERS`, which is the one thing it actually knows.

  `@stone-js/alibaba-fc-http-adapter` keeps its own reader, deliberately. Alibaba FC hands the handler a plain object, not a request: its headers are a record of strings or arrays and its body is already a `Buffer`, so there is no Web request there to normalise. It takes from `http-core` what is genuinely shared, the normalized shape and the header-level predicates, and keeps the part that is FC's own. Reuse follows what the platform hands over, not what the file is named.

  Removing the copies also removed the coverage they contributed, which uncovered two things worth more than the deduplication. Neither adapter had a single test that carried a request through its own middleware: every test asserted one piece in isolation, so the path from the platform handler to the answer had never been executed once, and a mis-wired normalizer would have passed. Both now have that test, a real request in and a real answer out. And both error-path tests were quietly proving nothing: they caught the rejection and accepted either outcome, and they set `stone.adapter.errorHandlers` while the kernel reads `stone.adapter.errorHandlers.default`, so the error handler was never reached. Both now assert that the adapter answers instead of throwing, and that the handler was consulted.

- Updated dependencies [9ba6f7b]
  - @stone-js/http-core@0.8.18
  - @stone-js/core@0.8.18
  - @stone-js/config@0.8.18
  - @stone-js/filesystem@0.8.18

## 0.8.17

### Patch Changes

- Updated dependencies [07b3cc9]
  - @stone-js/core@0.8.17
  - @stone-js/filesystem@0.8.17
  - @stone-js/http-core@0.8.17
  - @stone-js/config@0.8.17

## 0.8.16

### Patch Changes

- Updated dependencies [2c11b54]
  - @stone-js/http-core@0.8.16
  - @stone-js/core@0.8.16
  - @stone-js/config@0.8.16
  - @stone-js/filesystem@0.8.16

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/config@0.8.15
- @stone-js/filesystem@0.8.15
- @stone-js/http-core@0.8.15

## 0.8.14

### Patch Changes

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/core@0.8.14
  - @stone-js/http-core@0.8.14
  - @stone-js/filesystem@0.8.14
  - @stone-js/config@0.8.14

## 0.8.13

### Patch Changes

- Updated dependencies [8c2b600]
  - @stone-js/http-core@0.8.13
  - @stone-js/core@0.8.13
  - @stone-js/config@0.8.13
  - @stone-js/filesystem@0.8.13

## 0.8.12

### Patch Changes

- Updated dependencies [047d9b0]
- Updated dependencies [c971168]
  - @stone-js/http-core@0.8.12
  - @stone-js/core@0.8.12
  - @stone-js/filesystem@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/http-core@0.8.11
  - @stone-js/core@0.8.11
  - @stone-js/filesystem@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/filesystem@0.8.10
  - @stone-js/http-core@0.8.10
  - @stone-js/config@0.8.10

## 0.8.9

### Patch Changes

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- Updated dependencies [97a6730]
- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/http-core@0.8.9
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9
  - @stone-js/filesystem@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/config@0.8.8
- @stone-js/filesystem@0.8.8
- @stone-js/http-core@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/config@0.8.7
- @stone-js/filesystem@0.8.7
- @stone-js/http-core@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/config@0.8.6
- @stone-js/filesystem@0.8.6
- @stone-js/http-core@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/config@0.8.5
- @stone-js/filesystem@0.8.5
- @stone-js/http-core@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/config@0.8.4
- @stone-js/filesystem@0.8.4
- @stone-js/http-core@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/config@0.8.3
- @stone-js/filesystem@0.8.3
- @stone-js/http-core@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/filesystem@0.8.2
  - @stone-js/http-core@0.8.2
  - @stone-js/config@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/filesystem@0.8.1
  - @stone-js/http-core@0.8.1
  - @stone-js/config@0.8.1
