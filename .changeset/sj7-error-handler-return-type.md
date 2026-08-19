---
"@stone-js/core": patch
"@stone-js/router": patch
---

fix(core): the error-handler contract accepts what the kernel consumes

`IErrorHandler.handle` required a fully built response type, while the intended usage (and the framework's own `RouterErrorHandler`) returns plain response options that the kernel hands to its `responseResolver`. The framework cast itself and every consumer had to reproduce that cast.

`FunctionalErrorHandler` now returns `UResponse | ResponseResolverOptions`, a pure widening, so existing handlers keep compiling. `RouterErrorHandler` drops its internal cast accordingly.
