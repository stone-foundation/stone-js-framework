---
"@stone-js/core": patch
---

Code-quality pass (SonarCloud) with one security fix.

- Fix a broken JSONP callback sanitizer in `@stone-js/http-core`: a malformed character class
  (`[^\\[\\]\w$.]`) closed early, so the "sanitized" callback was left almost untouched and could
  carry `<`/`>`. It now strips characters outside `[\w$.[\]]`, closing a reflected-XSS vector.
- Harden the website deploy workflow: GitHub Pages permissions moved from workflow level to the
  jobs that need them (least privilege).
- Assorted maintainability cleanups: `RegExp.exec` over `String.match`, `Set` membership,
  `export…from` re-exports, extracted nested templates/ternaries, `.some()` over
  `filter().length`, default parameters, and more.

No public runtime behavior change (other than the JSONP sanitizer now behaving as intended).
